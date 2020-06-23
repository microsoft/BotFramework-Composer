// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { luIndexer } from '@bfc/indexers';
import * as luUtil from '@bfc/indexers/lib/utils/luUtil';

import { LuActionType } from '../types';
const ctx: Worker = self as any;

const parse = (id: string, content: string) => {
  return { id, content, ...luIndexer.parse(content, id) };
};

ctx.onmessage = function (msg) {
  const { id: msgId, type, payload } = msg.data;
  const { content, id, intentName, intent } = payload;
  let result: any = null;
  try {
    switch (type) {
      case LuActionType.Parse: {
        result = parse(id, content);
        break;
      }
      case LuActionType.AddIntent: {
        result = luUtil.addIntent(content, intent);
        break;
      }
      case LuActionType.UpdateIntent: {
        result = luUtil.updateIntent(content, intentName, intent || null);
        break;
      }
      case LuActionType.RemoveIntent: {
        result = luUtil.removeIntent(content, intentName);
        break;
      }
    }

    ctx.postMessage({ id: msgId, payload: result });
  } catch (error) {
    ctx.postMessage({ id: msgId, error });
  }
};
