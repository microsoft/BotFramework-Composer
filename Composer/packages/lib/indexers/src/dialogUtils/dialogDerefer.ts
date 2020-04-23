// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import { LgFile, LuFile, importResolverGenerator, extractLgTemplateRefs } from '@bfc/shared';
import { template } from '@babel/core';

import { JsonWalk, VisitorFunc } from '../utils/jsonWalk';

import { ExtractLGFile } from './extractResources';

interface IStoreResource {
  // dialogs: DialogInfo[];
  // schemas: BotSchemas;
  lgFiles: LgFile[];
  luFiles: LuFile[];
}

interface IDialog {
  [key: string]: any;
}
/**
 *
 * @param prevDialog
 * @param currDialog
 */
// not like JsonDiff, DialogDiff compaire stop at { $kind, ... }, would not enter {}
export function DialogDeRefer(dialog: IDialog, locale: string, storeResource: IStoreResource): IDialog {
  const { lgFiles } = storeResource;
  const dialogLgFile = ExtractLGFile(dialog);
  // const dialogLuFile = ExtractLUFile(dialog);

  const lgImportresolver = importResolverGenerator(lgFiles, '.lg');
  const lgFile = lgImportresolver('.', dialogLgFile);
  const templates = { lgFile };
  console.log(templates);
  const usedTemplates: any[] = [];
  const deDialog = { ...dialog };
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk    */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    // it's a valid schema dialog node.
    if (has(value, '$kind')) {
      const targets: any[] = [];
      ['prompt', 'unrecognizedPrompt', 'invalidPrompt', 'defaultValueResponse', 'activity'].forEach(field => {
        if (has(value, field)) {
          targets.push({ value: value[field], path: `${path}#${value.$kind}#${field}` });
        }
      });
      targets.forEach(target => {
        usedTemplates.push(
          ...extractLgTemplateRefs(target.value).map(x => {
            return { name: x.name, path: target.path };
          })
        );
      });
    }
    return false;
  };
  JsonWalk('$', deDialog, visitor);

  return deDialog;
}
