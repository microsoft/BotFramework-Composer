// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as luUtil from '@bfc/indexers/lib/utils/luUtil';

import { LuActionType } from '../types';
const ctx: Worker = self as any;

export const handleMessage = (msg) => {
  const { type, payload } = msg.data;
  const { content, id } = payload;
  let result: any = null;
  switch (type) {
    case LuActionType.Parse: {
      result = luUtil.parse(id, content);
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
