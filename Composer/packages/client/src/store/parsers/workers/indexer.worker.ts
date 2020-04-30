// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { indexer } from '@bfc/indexers';

const ctx: Worker = self as any;

ctx.onmessage = function(msg) {
  const { id, payload } = msg.data;
  const { files, botName, schemas, locale } = payload;
  const { index } = indexer;

  const { dialogs, luFiles, lgFiles } = index(files, botName, schemas, locale);

  const msg1 = {
    id,
    payload: { dialogs, luFiles, lgFiles },
  };
  ctx.postMessage(msg1);
};
