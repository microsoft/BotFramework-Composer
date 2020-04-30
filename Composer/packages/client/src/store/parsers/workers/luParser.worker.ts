// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { luIndexer } from '@bfc/indexers';
import * as luUtil from '@bfc/indexers/lib/utils/luUtil';

import { LuActionType } from './../luParser';
import { LuPayload } from './../luParser';

const ctx: Worker = self as any;

const parse = (payload: LuPayload) => {
  const { targetId, content } = payload;
  const { parse } = luIndexer;

  const { intents, diagnostics } = parse(content, targetId);

  return { id: targetId, content, intents, diagnostics };
};

ctx.onmessage = function(msg) {
  const { id, type, payload } = msg.data;
  let result: any = null;
  switch (type) {
    case LuActionType.Parse: {
      result = parse(payload);
      break;
    }
    case LuActionType.AddIntent: {
      result = luUtil.addIntent(payload.content, payload.intent);
      break;
    }
    case LuActionType.UpdateIntent: {
      result = luUtil.updateIntent(payload.content, payload.intentName, payload.intent);
      break;
    }
    case LuActionType.RemoveIntent: {
      result = luUtil.removeIntent(payload.content, payload.intentName);
      break;
    }
  }

  const msg1 = {
    id,
    payload: result,
  };
  ctx.postMessage({ id, payload: result });
};
