// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luIndexer } from '@bfc/indexers';
import { updateIntent, checkSection } from '@bfc/indexers/lib/utils/luUtil';
import { parser } from '@microsoft/bf-lu/lib/parser';
import { FoldingRange } from 'vscode-languageserver';

import { WorkerMsg } from './luParser';
import { getLineByIndex } from './utils';

process.on('message', async (msg: WorkerMsg) => {
  try {
    switch (msg.type) {
      case 'parse': {
        const { id, content, config } = msg.payload;
        process.send?.({ id: msg.id, payload: luIndexer.parse(content, id, config) });
        break;
      }

      case 'updateIntent': {
        const { luFile, intentName, intent, luFeatures } = msg.payload;
        process.send?.({ id: msg.id, payload: updateIntent(luFile, intentName, intent, luFeatures) });
        break;
      }

      case 'parseFile': {
        const { text, log, locale } = msg.payload;
        process.send?.({ id: msg.id, payload: await parser.parseFile(text, log, locale) });
        break;
      }

      case 'checkSection': {
        const { intent, enableSections } = msg.payload;
        process.send?.({ id: msg.id, payload: checkSection(intent, enableSections) });
        break;
      }

      case 'getFoldingRanges': {
        const { document } = msg.payload;
        const items: FoldingRange[] = [];
        if (document) {
          const lineCount = document.lineCount;
          let i = 0;
          while (i < lineCount) {
            const currLine = getLineByIndex(document, i);
            if (currLine?.startsWith('>>')) {
              for (let j = i + 1; j < lineCount; j++) {
                if (getLineByIndex(document, j)?.startsWith('>>')) {
                  items.push(FoldingRange.create(i, j - 1));
                  i = j - 1;
                  break;
                }

                if (j === lineCount - 1) {
                  items.push(FoldingRange.create(i, j));
                  i = j;
                }
              }
            }

            i = i + 1;
          }
        }
        process.send?.({ id: msg.id, payload: items });
        break;
      }
    }
  } catch (error) {
    process.send?.({ id: msg.id, error });
  }
});
