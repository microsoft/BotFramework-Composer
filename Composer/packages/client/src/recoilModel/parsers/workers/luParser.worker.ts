// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { luUtil } from '@bfc/indexers';

import { LuActionType } from '../types';
const ctx: Worker = self as any;

ctx.onmessage = function (msg) {
  const { id: msgId, type, payload } = msg.data;
  const { content, id, intentName, intentNames, intent, intents } = payload;
  let result: any = null;
  try {
    switch (type) {
      case LuActionType.Parse: {
        result = luUtil.parse(id, content);
        break;
      }
      case LuActionType.AddIntent: {
        result = luUtil.addIntent(content, intent);
        break;
      }
      case LuActionType.AddIntents: {
        result = luUtil.addIntents(content, intents);
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
      case LuActionType.RemoveIntents: {
        result = luUtil.removeIntents(content, intentNames);
        break;
      }
    }

    ctx.postMessage({ id: msgId, payload: result });
  } catch (error) {
    ctx.postMessage({ id: msgId, error });
  }
};
