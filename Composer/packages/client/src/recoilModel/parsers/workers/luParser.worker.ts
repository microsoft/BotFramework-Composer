// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { luIndexer } from '@bfc/indexers';
import * as luUtil from '@bfc/indexers/lib/utils/luUtil';

import { LuActionType } from '../types';
const ctx: Worker = self as any;

const parse = (id: string, content: string) => {
  return { id, content, ...luIndexer.parse(content, id) };
};

export const handleMessage = (msg) => {
  const { type, payload } = msg.data;
  const { content, id, intentName, intent } = payload;
  let result: any = null;
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
  return result;
};

ctx.onmessage = function (msg) {
  const { id } = msg.data;
  try {
    const payload = handleMessage(msg);

    ctx.postMessage({ id, payload });
  } catch (error) {
    ctx.postMessage({ id, error });
  }
};
