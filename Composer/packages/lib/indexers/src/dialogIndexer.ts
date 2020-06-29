// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import uniq from 'lodash/uniq';
import {
  extractLgTemplateRefs,
  SDKKinds,
  ITrigger,
  DialogInfo,
  FileInfo,
  LgTemplateJsonPath,
  ReferredLuIntents,
  Diagnostic,
} from '@bfc/shared';

import { JsonWalk, VisitorFunc } from './utils/jsonWalk';
import { getBaseName } from './utils/help';
import ExtractIntentTriggers from './dialogUtils/extractIntentTriggers';
import { createPath } from './validations/expressionValidation/utils';
// find out all lg templates given dialog
function ExtractLgTemplates(id, dialog): LgTemplateJsonPath[] {
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
      targets.forEach((target) => {
        templates.push(
          ...extractLgTemplateRefs(target.value).map((x) => {
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
  templates.forEach((t) => {
    if (!res.find((r) => r.name === t.name)) {
      res.push(t);
    }
  });
  return res;
}

// find out all lu intents given dialog
function ExtractLuIntents(dialog, id: string): ReferredLuIntents[] {
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
function ExtractTriggers(dialog): ITrigger[] {
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
function ExtractReferredDialogs(dialog): string[] {
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

function parse(id: string, content: any) {
  const luFile = typeof content.recognizer === 'string' ? content.recognizer : '';
  const lgFile = typeof content.generator === 'string' ? content.generator : '';
  const diagnostics: Diagnostic[] = [];
  return {
    id,
    content,
    diagnostics,
    referredDialogs: ExtractReferredDialogs(content),
    lgTemplates: ExtractLgTemplates(id, content),
    referredLuIntents: ExtractLuIntents(content, id),
    luFile: getBaseName(luFile, '.lu'),
    lgFile: getBaseName(lgFile, '.lg'),
    triggers: ExtractTriggers(content),
    intentTriggers: ExtractIntentTriggers(content),
  };
}

function index(files: FileInfo[], botName: string): DialogInfo[] {
  const dialogs: DialogInfo[] = [];
  if (files.length !== 0) {
    for (const file of files) {
      try {
        if (file.name.endsWith('.dialog') && !file.name.endsWith('.lu.dialog')) {
          const dialogJson = JSON.parse(file.content);
          const id = getBaseName(file.name, '.dialog');
          const isRoot = file.relativePath.includes('/') === false; // root dialog should be in root path
          const dialog = {
            isRoot,
            displayName: isRoot ? `${botName}` : id,
            ...parse(id, dialogJson),
          };
          dialogs.push(dialog);
        }
      } catch (e) {
        throw new Error(`parse failed at ${file.name}, ${e}`);
      }
    }
  }
  return dialogs;
}

export const dialogIndexer = {
  index,
  parse,
};
