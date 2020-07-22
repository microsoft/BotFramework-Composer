// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection } from '@bfc/shared';

import Worker from './workers/luParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { LuPayload, LuActionType } from './types';

// Wrapper class
class LuWorker extends BaseWorker<LuActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<LuPayload>(LuActionType.Parse, payload);
  }

  addIntent(content: string, intent: LuIntentSection) {
    const payload = { content, intent };
    return this.sendMsg<LuPayload>(LuActionType.AddIntent, payload);
  }

  updateIntent(content: string, intentName: string, intent?: LuIntentSection) {
    const payload = { content, intentName, intent };
    return this.sendMsg<LuPayload>(LuActionType.UpdateIntent, payload);
  }

  removeIntent(content: string, intentName: string) {
    const payload = { content, intentName };
    return this.sendMsg<LuPayload>(LuActionType.RemoveIntent, payload);
  }

  addIntents(content: string, intents: LuIntentSection[]) {
    const payload = { content, intents };
    return this.sendMsg<LuPayload>(LuActionType.AddIntents, payload);
  }

  removeIntents(content: string, intentNames: string[]) {
    const payload = { content, intentNames };
    return this.sendMsg<LuPayload>(LuActionType.RemoveIntents, payload);
  }
}

export default new LuWorker(new Worker());
