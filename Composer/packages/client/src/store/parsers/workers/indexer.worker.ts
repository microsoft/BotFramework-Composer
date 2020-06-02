// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { indexer } from '@bfc/indexers';

const ctx: Worker = self as any;

ctx.onmessage = function (msg) {
  const { id, payload } = msg.data;
  const { files, botName, locale } = payload;
  const { index } = indexer;

  try {
    const { dialogs, luFiles, lgFiles } = index(files, botName, locale);
    ctx.postMessage({ id, payload: { dialogs, luFiles, lgFiles } });
  } catch (error) {
    ctx.postMessage({ id, error });
  }
};
