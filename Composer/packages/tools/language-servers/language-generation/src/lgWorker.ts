// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lgImportResolverGenerator } from '@bfc/shared';
import { lgUtil } from '@bfc/indexers';
import uniq from 'lodash/uniq';

import { findAllExprs } from '../lib/utils';

import { WorkerMsg } from './lgParser';
import { getSuggestionEntities, extractLUISContent, suggestionAllEntityTypes } from './utils';

process.on('message', async (msg: WorkerMsg) => {
  try {
    switch (msg.type) {
      case 'extractLuisEntity': {
        let suggestEntities: string[] = [];
        const { luContents } = msg.payload;
        if (luContents) {
          for (const content of luContents) {
            const luisJson = await extractLUISContent(content);
            suggestEntities = suggestEntities.concat(getSuggestionEntities(luisJson, suggestionAllEntityTypes));
          }
        }

        process.send?.({ id: msg.id, payload: { suggestEntities: uniq(suggestEntities) } });
        break;
      }

      case 'parse': {
        const { id, content, lgFiles } = msg.payload;
        const { templates, allTemplates, diagnostics } = lgUtil.parse(id, content, lgFiles);
        process.send?.({ id: msg.id, payload: { id, content, templates, allTemplates, diagnostics } });
        break;
      }

      case 'updateTemplate': {
        const { lgFile, templateName, template, lgFiles } = msg.payload;
        const lgImportResolver = lgImportResolverGenerator(lgFiles, '.lg');
        const { id, content, templates, allTemplates, diagnostics } = lgUtil.updateTemplate(
          lgFile,
          templateName,
          template,
          lgImportResolver
        );
        process.send?.({ id: msg.id, payload: { id, content, templates, allTemplates, diagnostics } });
        break;
      }

      case 'extractLGVariables': {
        const { curCbangedFile, lgFiles } = msg.payload;
        let result: string[] = [];
        if (curCbangedFile) {
          result = findAllExprs(curCbangedFile);
        } else {
          result = findAllExprs(lgFiles);
        }

        process.send?.({ id: msg.id, payload: { lgVariables: result } });
        break;
      }
    }
  } catch (error) {
    process.send?.({ id: msg.id, error });
  }
});
