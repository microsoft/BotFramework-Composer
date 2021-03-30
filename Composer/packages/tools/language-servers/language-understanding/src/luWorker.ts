// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luIndexer } from '@bfc/indexers';
import { updateIntent, checkSection } from '@bfc/indexers/lib/utils/luUtil';
import { parser } from '@microsoft/bf-lu/lib/parser';

import { WorkerMsg } from './luParser';
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
    }
  } catch (error) {
    process.send?.({ id: msg.id, error });
  }
});
