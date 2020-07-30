// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { qnaIndexer } from '@bfc/indexers';
import * as qnaUtil from '@bfc/indexers/lib/utils/qnaUtil';

import { QnAActionType } from './../types';
const ctx: Worker = self as any;

const parse = (content: string, id: string) => {
  return { id, content, ...qnaIndexer.parse(content, id) };
};

ctx.onmessage = function (msg) {
  const { id: msgId, type, payload } = msg.data;
  const { content, id, file, indexId } = payload;
  let result: any = null;
  try {
    switch (type) {
      case QnAActionType.Parse: {
        result = parse(content, id);
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
    ctx.postMessage({ id: msgId, error });
  }
};
