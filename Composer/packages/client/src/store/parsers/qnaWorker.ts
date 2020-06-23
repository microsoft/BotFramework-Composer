// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Worker from './workers/qnaParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { QnAPayload, QnAActionType } from './types';

// Wrapper class
class QnAWorker extends BaseWorker<QnAActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<QnAPayload>(QnAActionType.Parse, payload);
  }

  addSection(content: string, newContent: string) {
    const payload = { content, newContent };
    return this.sendMsg<QnAPayload>(QnAActionType.AddSection, payload);
  }

  updateSection(indexId: number, content: string, newContent: string) {
    const payload = { indexId, content, newContent };
    return this.sendMsg<QnAPayload>(QnAActionType.UpdateSection, payload);
  }

  removeSection(indexId: number, content: string) {
    const payload = { content, indexId };
    return this.sendMsg<QnAPayload>(QnAActionType.RemoveSection, payload);
  }
}

export default new QnAWorker(new Worker());
