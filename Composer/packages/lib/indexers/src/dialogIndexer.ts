// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import { DialogInfo, FileInfo, Diagnostic } from '@bfc/shared';

import ExtractMemoryPaths from './dialogUtils/extractMemoryPaths';
import ExtractIntentTriggers from './dialogUtils/extractIntentTriggers';
import {
  ExtractLgTemplates,
  ExtractLuIntents,
  ExtractReferredDialogs,
  ExtractTriggers,
  ExtractLGFile,
  ExtractLUFile,
} from './dialogUtils/extractResources';
import { checkerFuncs } from './dialogUtils/dialogChecker';
import { JsonWalk, VisitorFunc } from './utils/jsonWalk';
import { getBaseName } from './utils/help';

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
    if (has(value, '$kind')) {
      const allChecks = [...checkerFuncs['.']];
      const checkerFunc = checkerFuncs[value.$kind];
      if (checkerFunc) {
        allChecks.splice(0, 0, ...checkerFunc);
      }

      allChecks.forEach(func => {
        const result = func(path, value, value.$kind, schema.definitions[value.$kind]);
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
  return {
    id,
    content,
    diagnostics: validate(id, content, schema),
    referredDialogs: ExtractReferredDialogs(content),
    lgTemplates: ExtractLgTemplates(id, content),
    userDefinedVariables: ExtractMemoryPaths(content),
    referredLuIntents: ExtractLuIntents(content, id),
    luFile: ExtractLUFile(content),
    lgFile: ExtractLGFile(content),
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
          const isRoot = file.relativePath.includes('/') === false; // root dialog should be in root path
          const dialog = {
            isRoot,
            displayName: isRoot ? `${botName}.Main` : id,
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

function parseSnippet(content: any) {
  return {
    referredDialogs: ExtractReferredDialogs(content),
    lgTemplates: ExtractLgTemplates('$', content),
    userDefinedVariables: ExtractMemoryPaths(content),
    referredLuIntents: ExtractLuIntents(content, '$'),
    triggers: ExtractTriggers(content),
    intentTriggers: ExtractIntentTriggers(content),
  };
}

export const dialogIndexer = {
  index,
  parse,
  parseSnippet,
};
