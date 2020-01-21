// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import uniq from 'lodash/uniq';
import { extractLgTemplateRefs } from '@bfc/shared';

import { checkerFuncs } from './dialogUtils/dialogChecker';
import { ITrigger, DialogInfo, FileInfo } from './type';
import { JsonWalk, VisitorFunc } from './utils/jsonWalk';
import { getBaseName } from './utils/help';
import { Diagnostic } from './diagnostic';
import ExtractMemoryPaths from './dialogUtils/extractMemoryPaths';

// find out all lg templates given dialog
function ExtractLgTemplates(dialog): string[] {
  const templates: string[] = [];
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk    */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$type')) {
      const targets: string[] = [];
      // look for prompt field
      if (has(value, 'prompt')) {
        targets.push(value.prompt);
      }
      // look for unrecognizedPrompt field
      if (has(value, 'unrecognizedPrompt')) {
        targets.push(value.unrecognizedPrompt);
      }
      // look for other $type
      switch (value.$type) {
        case 'Microsoft.SendActivity':
          targets.push(value.activity);
          break; // if we want stop at some $type, do here
        case 'location':
          return true;
      }
      targets.forEach(target => {
        templates.push(...extractLgTemplateRefs(target).map(x => x.name));
      });
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return uniq(templates);
}

// find out all lu intents given dialog
function ExtractLuIntents(dialog): string[] {
  const intents: string[] = [];
  /**    *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$type') && value.$type === 'Microsoft.OnIntent') {
      const intentName = value.intent;
      intents.push(intentName);
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return uniq(intents);
}

// find out all triggers given dialog
function ExtractTriggers(dialog): ITrigger[] {
  const trigers: ITrigger[] = [];
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
          trigers.push(trigger);
        }
      });
      return true;
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return trigers;
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
    lgTemplates: ExtractLgTemplates(content),
    luIntents: ExtractLuIntents(content),
    userDefinedVariables: ExtractMemoryPaths(content),
    luFile: getBaseName(luFile, '.lu'),
    lgFile: getBaseName(lgFile, '.lg'),
    triggers: ExtractTriggers(content),
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
