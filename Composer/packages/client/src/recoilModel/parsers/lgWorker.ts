// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';

import Worker from './workers/lgParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { LgActionType, LgParsePayload } from './types';

// Wrapper class
class LgWorker extends BaseWorker<LgActionType> {
  parse(targetId: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgParsePayload>(LgActionType.Parse, { targetId, content, lgFiles: lgFiles });
  }
}

export default new LgWorker(new Worker());
