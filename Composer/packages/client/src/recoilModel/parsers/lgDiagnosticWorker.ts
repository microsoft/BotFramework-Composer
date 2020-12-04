// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';

import Worker from './workers/lgParserDiagnostic.worker.ts';
import { BaseWorker } from './baseWorker';
import { LgActionType, LgParsePayload } from './types';

// Wrapper class
class LgWorker extends BaseWorker<LgActionType> {
  parse(projectId: string, id: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgParsePayload>(LgActionType.Parse, { id, content, lgFiles, projectId });
  }
}

export default new LgWorker(new Worker());
