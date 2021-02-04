// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import Worker from './workers/qnaParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { QnAPayload, QnAIndexPayload, QnAActionType } from './types';

// Wrapper class
class QnAWorker extends BaseWorker<QnAActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<QnAPayload>(QnAActionType.Parse, payload);
  }

  index(projectId: string, rawQnAFiles: FileInfo[]) {
    const payload = { projectId, id: projectId, rawQnAFiles };
    return this.sendMsg<QnAIndexPayload>(QnAActionType.Index, payload);
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
