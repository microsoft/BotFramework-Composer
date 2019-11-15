// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import uniq from 'lodash/uniq';

import { ITrigger, DialogInfo, FileInfo } from './type';
import { DialogChecker } from './utils/dialogChecker';
import { JsonWalk, VisitorFunc } from './utils/jsonWalk';
import { getBaseName } from './utils/help';
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
        // match a template name match a temlate func  e.g. `showDate()`
        // eslint-disable-next-line security/detect-unsafe-regex
        const reg = /\[([A-Za-z_][-\w]+)(\(.*\))?\]/g;
        let matchResult;
        while ((matchResult = reg.exec(target)) !== null) {
          const templateName = matchResult[1];
          templates.push(templateName);
        }
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
function CheckFields(dialog): string[] {
  const errors: string[] = [];
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$type') && has(DialogChecker, value.$type)) {
      const matchedCheckers = DialogChecker[value.$type];
      matchedCheckers.forEach(checker => {
        const checkRes = checker.apply(null, [
          {
            path,
            value,
          },
        ]);
        if (checkRes) {
          Array.isArray(checkRes) ? errors.push(...checkRes) : errors.push(checkRes);
        }
      });
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);
  return errors;
}
function parse(content) {
  const luFile = typeof content.recognizer === 'string' ? content.recognizer : '';
  const lgFile = typeof content.generator === 'string' ? content.generator : '';
  return {
    content,
    diagnostics: CheckFields(content),
    referredDialogs: ExtractReferredDialogs(content),
    lgTemplates: ExtractLgTemplates(content),
    luIntents: ExtractLuIntents(content),
    luFile: getBaseName(luFile, '.lu'),
    lgFile: getBaseName(lgFile, '.lg'),
    triggers: ExtractTriggers(content),
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
          const isRoot = id === 'Main';
          const dialog = {
            id,
            isRoot,
            displayName: isRoot ? `${botName}.Main` : id,
            content: dialogJson,
            relativePath: file.relativePath,
            ...parse(dialogJson),
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
