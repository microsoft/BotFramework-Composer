// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Worker from './workers/qnaParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { QnAPayload, QnAActionType } from './types';

// Wrapper class
class QnAWorker extends BaseWorker {
  parse(id: string, content: string) {
    const payload = { type: QnAActionType.Parse, id, content };
    return this.sendMsg<QnAPayload>(payload);
  }

  addSection(content: string, newContent: string) {
    const payload = { type: QnAActionType.AddSection, content, newContent };
    return this.sendMsg<QnAPayload>(payload);
  }

  updateSection(indexId: number, content: string, newContent: string) {
    const payload = { type: QnAActionType.UpdateSection, indexId, content, newContent };
    return this.sendMsg<QnAPayload>(payload);
  }

  removeSection(indexId: number, content: string) {
    const payload = { type: QnAActionType.RemoveSection, content, indexId };
    return this.sendMsg<QnAPayload>(payload);
  }
}

export default new QnAWorker(new Worker());
