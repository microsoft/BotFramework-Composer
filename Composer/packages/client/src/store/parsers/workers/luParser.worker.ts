// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luIndexer } from '@bfc/indexers';

const ctx: Worker = self as any;

ctx.onmessage = function(msg) {
  const { id, payload } = msg.data;
  const { targetId, content } = payload;
  const { parse } = luIndexer;

  const { intents, diagnostics } = parse(content, targetId);

  const msg1 = {
    id,
    payload: { id: targetId, content, intents, diagnostics },
  };
  ctx.postMessage(msg1);
};
