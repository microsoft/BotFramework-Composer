// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import uniq from 'lodash/uniq';
import { extractLgTemplateRefs, SDKKinds, ITrigger, LgTemplateJsonPath, ReferredLuIntents } from '@bfc/shared';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';
import { getBaseName } from '../utils/help';

import { createPath } from './dialogChecker';

interface DialogResources {
  lgTemplates: LgTemplateJsonPath[];
  luIntents: ReferredLuIntents[];
}

// find out all lg templates given dialog
export function ExtractLgTemplates(id: string, dialog: { [key: string]: any }): LgTemplateJsonPath[] {
  const templates: LgTemplateJsonPath[] = [];
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk    */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$kind')) {
      const targets: any[] = [];
      // look for prompt field
      if (has(value, 'prompt')) {
        targets.push({ value: value.prompt, path: `${path}#${value.$kind}#prompt` });
      }
      // look for unrecognizedPrompt field
      if (has(value, 'unrecognizedPrompt')) {
        targets.push({ value: value.unrecognizedPrompt, path: `${path}#${value.$kind}#unrecognizedPrompt` });
      }

      if (has(value, 'invalidPrompt')) {
        targets.push({ value: value.invalidPrompt, path: `${path}#${value.$kind}#invalidPrompt` });
      }

      if (has(value, 'defaultValueResponse')) {
        targets.push({ value: value.defaultValueResponse, path: `${path}#${value.$kind}#defaultValueResponse` });
      }
      // look for other $kind
      switch (value.$kind) {
        case SDKKinds.SendActivity:
          targets.push({ value: value.activity, path: path });
          break; // if we want stop at some $kind, do here
        case 'location':
          return true;
      }
      targets.forEach(target => {
        templates.push(
          ...extractLgTemplateRefs(target.value).map(x => {
            return { name: x.name, path: target.path };
          })
        );
      });
    }
    return false;
  };
  JsonWalk(id, dialog, visitor);
  //uniquify lgTemplates based on name
  const res: LgTemplateJsonPath[] = [];
  templates.forEach(t => {
    if (!res.find(r => r.name === t.name)) {
      res.push(t);
    }
  });
  return res;
}

// find out all lu intents given dialog
export function ExtractLuIntents(id: string, dialog: { [key: string]: any }): ReferredLuIntents[] {
  const intents: ReferredLuIntents[] = [];
  /**    *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$kind') && value.$kind === SDKKinds.OnIntent) {
      const intentName = value.intent;
      intents.push({
        name: intentName,
        path: createPath(path, value.$kind),
      });
    }
    return false;
  };
  JsonWalk(id, dialog, visitor);
  return uniq(intents);
}

// find out all triggers given dialog
export function ExtractTriggers(dialog: { [key: string]: any }): ITrigger[] {
  const triggers: ITrigger[] = [];
  /**    *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, 'triggers') && Array.isArray(value.triggers)) {
      value.triggers.forEach((rule: any, index: number) => {
        // make sure event is actualy an event type, not OnDialogEvent.events array
        if (rule && typeof rule === 'object' && rule.$kind) {
          const trigger: ITrigger = {
            id: `triggers[${index}]`,
            displayName: '',
            type: rule.$kind,
            isIntent: rule.$kind === SDKKinds.OnIntent,
          };
          if (has(rule, '$designer.name')) {
            trigger.displayName = rule.$designer.name;
          } else if (trigger.isIntent && has(rule, 'intent')) {
            trigger.displayName = rule.intent;
          }
          triggers.push(trigger);
        }
      });
      return true;
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return triggers;
}

// find out all referred dialog
export function ExtractReferredDialogs(dialog: { [key: string]: any }): string[] {
  const dialogs: string[] = [];
  /**    *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$kind') && value.$kind === SDKKinds.BeginDialog) {
      const dialogName = value.dialog;
      dialogs.push(dialogName);
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return uniq(dialogs);
}

// find out all referred dialog
export function ExtractLGFile(dialog: { [key: string]: any }): string {
  const lgFile = typeof dialog.generator === 'string' ? dialog.generator : '';
  return getBaseName(lgFile, '.lg');
}

// find out all referred dialog
export function ExtractLUFile(dialog: { [key: string]: any }): string {
  const luFile = typeof dialog.recognizer === 'string' ? dialog.recognizer : '';
  return getBaseName(luFile, '.lu');
}

// find out all lg/lu resource from given dialog (json value)
export function ExtractResources(content: { [key: string]: any }): DialogResources {
  return {
    lgTemplates: ExtractLgTemplates('$', content),
    luIntents: ExtractLuIntents('$', content),
  };
}
