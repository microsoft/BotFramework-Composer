// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Worker from 'worker-loader!./workers/luParser.worker.ts';

import { BaseParser } from './baseParser';

export type LuPayload = {
  targetId: string;
  content: string;
};

// Wrapper class
class LuParser extends BaseParser {
  parse(targetId: string, content: string) {
    return this.sendMsg<LuPayload>({ targetId, content });
  }
}

export default new LuParser(new Worker());
