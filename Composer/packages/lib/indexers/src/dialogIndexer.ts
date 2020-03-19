// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import uniq from 'lodash/uniq';
import {
  extractLgTemplateRefs,
  ITrigger,
  DialogInfo,
  FileInfo,
  LgTemplateJsonPath,
  Diagnostic,
  ReferredLuIntents,
} from '@bfc/shared';

import { createPath } from './dialogUtils/dialogChecker';
import { checkerFuncs } from './dialogUtils/dialogChecker';
import { JsonWalk, VisitorFunc } from './utils/jsonWalk';
import { getBaseName } from './utils/help';
import ExtractMemoryPaths from './dialogUtils/extractMemoryPaths';
import ExtractIntentTriggers from './dialogUtils/extractIntentTriggers';
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
    if (has(value, '$type')) {
      const targets: any[] = [];
      // look for prompt field
      if (has(value, 'prompt')) {
        targets.push({ value: value.prompt, path: `${path}#${value.$type}#prompt` });
      }
      // look for unrecognizedPrompt field
      if (has(value, 'unrecognizedPrompt')) {
        targets.push({ value: value.unrecognizedPrompt, path: `${path}#${value.$type}#unrecognizedPrompt` });
      }

      if (has(value, 'invalidPrompt')) {
        targets.push({ value: value.invalidPrompt, path: `${path}#${value.$type}#invalidPrompt` });
      }

      if (has(value, 'defaultValueResponse')) {
        targets.push({ value: value.defaultValueResponse, path: `${path}#${value.$type}#defaultValueResponse` });
      }
      // look for other $type
      switch (value.$type) {
        case 'Microsoft.SendActivity':
          targets.push({ value: value.activity, path: path });
          break; // if we want stop at some $type, do here
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
function ExtractLuIntents(dialog, id: string): ReferredLuIntents[] {
  const intents: ReferredLuIntents[] = [];
  /**    *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$type') && value.$type === 'Microsoft.OnIntent') {
      const intentName = value.intent;
      intents.push({
        name: intentName,
        path: createPath(path, value.$type),
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
        if (rule && typeof rule === 'object' && rule.$type) {
          const trigger: ITrigger = {
            id: `triggers[${index}]`,
            displayName: '',
            type: rule.$type,
            isIntent: rule.$type === 'Microsoft.OnIntent',
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
    if (has(value, '$type') && value.$type === 'Microsoft.BeginDialog') {
      const dialogName = value.dialog;
      dialogs.push(dialogName);
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return uniq(dialogs);
}

// check all fields
function CheckFields(dialog, id: string, schema: any): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (has(value, '$type')) {
      const allChecks = [...checkerFuncs['.']];
      const checkerFunc = checkerFuncs[value.$type];
      if (checkerFunc) {
        allChecks.splice(0, 0, ...checkerFunc);
      }

      allChecks.forEach(func => {
        const result = func(path, value, value.$type, schema.definitions[value.$type]);
        if (result) {
          diagnostics.splice(0, 0, ...result);
        }
      });
    }
    return false;
  };
  JsonWalk(id, dialog, visitor);
  return diagnostics.map(e => {
    e.source = id;
    return e;
  });
}

function validate(id: string, content, schema: any): Diagnostic[] {
  try {
    return CheckFields(content, id, schema);
  } catch (error) {
    return [new Diagnostic(error.message, id)];
  }
}

function parse(id: string, content: any, schema: any) {
  const luFile = typeof content.recognizer === 'string' ? content.recognizer : '';
  const lgFile = typeof content.generator === 'string' ? content.generator : '';

  return {
    content,
    diagnostics: validate(id, content, schema),
    referredDialogs: ExtractReferredDialogs(content),
    lgTemplates: ExtractLgTemplates(id, content),
    userDefinedVariables: ExtractMemoryPaths(content),
    referredLuIntents: ExtractLuIntents(content, id),
    luFile: getBaseName(luFile, '.lu'),
    lgFile: getBaseName(lgFile, '.lg'),
    triggers: ExtractTriggers(content),
    intentTriggers: ExtractIntentTriggers(content),
  };
}

function index(files: FileInfo[], botName: string, schema: any): DialogInfo[] {
  const dialogs: DialogInfo[] = [];
  if (files.length !== 0) {
    for (const file of files) {
      try {
        if (file.name.endsWith('.dialog') && !file.name.endsWith('.lu.dialog')) {
          const dialogJson = JSON.parse(file.content);
          const id = getBaseName(file.name, '.dialog');
          const isRoot = id === 'Main';
          const dialog = {
            id,
            isRoot,
            displayName: isRoot ? `${botName}.Main` : id,
            content: dialogJson,
            relativePath: file.relativePath,
            lastModified: file.lastModified,
            ...parse(id, dialogJson, schema),
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
