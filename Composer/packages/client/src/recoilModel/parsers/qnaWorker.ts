// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextFile } from '@bfc/shared';

import Worker from './workers/qnaParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { QnAActionType, QnAParseAllPayload, QnAParsePayload } from './types';

// Wrapper class
class QnAWorker extends BaseWorker<QnAActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<QnAParsePayload>(QnAActionType.Parse, payload);
  }

  parseAll(qnaResources: TextFile[]) {
    const payload = { qnaResources };
    return this.sendMsg<QnAParseAllPayload>(QnAActionType.ParseAll, payload);
  }
}

export default new QnAWorker(new Worker());
