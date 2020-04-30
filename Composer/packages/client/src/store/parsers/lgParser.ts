// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';
import Worker from 'worker-loader!./workers/lgParser.worker.ts';

import { BaseParser } from './baseParser';

export type LgPayload = {
  targetId: string;
  content: string;
  lgFiles: LgFile[];
};

// Wrapper class
class LgParser extends BaseParser {
  parse(targetId: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgPayload>({ targetId, content, lgFiles: lgFiles });
  }
}

export default new LgParser(new Worker());
