// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as qnaUtil from '@bfc/indexers/lib/utils/qnaUtil';

import { QnAActionType, QnAParseAllPayload, QnAParsePayload } from './../types';
const ctx: Worker = self as any;

type ParseMessage = {
  id: string;
  type: QnAActionType.Parse;
  payload: QnAParsePayload;
};

type ParseAllMessage = {
  id: string;
  type: QnAActionType.ParseAll;
  payload: QnAParseAllPayload;
};

type QnaMessageEvent = ParseMessage | ParseAllMessage;

export const handleMessage = (msg: QnaMessageEvent) => {
  let result: any = null;
  switch (msg.type) {
    case QnAActionType.Parse: {
      const { id, content } = msg.payload;
      result = qnaUtil.parse(id, content);
      break;
    }

    case QnAActionType.ParseAll: {
      const { qnaResources } = msg.payload;
      result = qnaResources.map(({ id, content }) => qnaUtil.parse(id, content));
      break;
    }
  }
  return result;
};

ctx.onmessage = function (event) {
  const msg = event.data as QnaMessageEvent;
  try {
    const payload = handleMessage(msg);
    ctx.postMessage({ id: msg.id, payload });
  } catch (error) {
    ctx.postMessage({ id: msg.id, error: error.message });
  }
};
