// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as qnaUtil from '@bfc/indexers/lib/utils/qnaUtil';

import { QnAActionType } from './../types';
const ctx: Worker = self as any;

ctx.onmessage = function (msg) {
  const { id: msgId, type, payload } = msg.data;
  const { content, id, file, indexId } = payload;
  let result: any = null;
  try {
    switch (type) {
      case QnAActionType.Parse: {
        result = qnaUtil.parse(id, content);
        break;
      }
      case QnAActionType.AddSection: {
        result = qnaUtil.addSection(file.content, content);
        break;
      }
      case QnAActionType.UpdateSection: {
        result = qnaUtil.updateSection(indexId, file.content, content);
        break;
      }
      case QnAActionType.RemoveSection: {
        result = qnaUtil.removeSection(indexId, file.content);
        break;
      }
    }
    ctx.postMessage({ id: msgId, payload: result });
  } catch (error) {
    ctx.postMessage({ id: msgId, error: error.message });
  }
};
