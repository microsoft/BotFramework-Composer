// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { importResolverGenerator } from '@bfc/shared';
import { lgIndexer } from '@bfc/indexers';

import { LgActionType, LgParsePayload } from '../types';

const ctx: Worker = self as any;

interface ParseMessage {
  id: string;
  type: LgActionType.Parse;
  payload: LgParsePayload;
}

type LgMessageEvent = ParseMessage;

export const handleMessage = (msg: LgMessageEvent) => {
  let payload: any = null;
  switch (msg.type) {
    case LgActionType.Parse: {
      const { targetId, content, lgFiles } = msg.payload;
      const { parse } = lgIndexer;

      const lgImportResolver = importResolverGenerator(lgFiles, '.lg');

      const { templates, diagnostics } = parse(content, targetId, lgImportResolver);
      payload = { id: targetId, content, templates, diagnostics };
      break;
    }
  }
  return payload;
};

ctx.onmessage = function (event) {
  const msg = event.data as LgMessageEvent;

  try {
    const payload = handleMessage(msg);

    ctx.postMessage({ id: msg.id, payload });
  } catch (error) {
    ctx.postMessage({ id: msg.id, error });
  }
};
