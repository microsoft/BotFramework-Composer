// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { importResolverGenerator } from '@bfc/shared';
import { lgIndexer } from '@bfc/indexers';

const ctx: Worker = self as any;

ctx.onmessage = function (msg) {
  const { id, payload } = msg.data;
  const { targetId, content, lgFiles } = payload;
  const { parse } = lgIndexer;
  try {
    const lgImportresolver = importResolverGenerator(lgFiles, '.lg');

    ctx.postMessage({ id, payload: { id: targetId, content, ...parse(content, targetId, lgImportresolver) } });
  } catch (error) {
    ctx.postMessage({ id, error });
  }
};
