// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection } from '@bfc/shared';

import Worker from './workers/luParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { LuPayload, LuActionType } from './types';

// Wrapper class
class LuWorker extends BaseWorker {
  parse(id: string, content: string) {
    const payload = { type: LuActionType.Parse, id, content };
    return this.sendMsg<LuPayload>(payload);
  }

  addIntent(content: string, intent: LuIntentSection) {
    const payload = { type: LuActionType.AddIntent, content, intent };
    return this.sendMsg<LuPayload>(payload);
  }

  updateIntent(content: string, intentName: string, intent?: LuIntentSection) {
    const payload = { type: LuActionType.UpdateIntent, content, intentName, intent };
    return this.sendMsg<LuPayload>(payload);
  }

  removeIntent(content: string, intentName: string) {
    const payload = { type: LuActionType.RemoveIntent, content, intentName };
    return this.sendMsg<LuPayload>(payload);
  }
}

export default new LuWorker(new Worker());
