// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LuFile } from '@bfc/shared';

import Worker from './workers/luParser.worker.ts';
import { BaseWorker } from './baseWorker';
import {
  LuActionType,
  LuParsePayload,
  LuAddIntentPayload,
  LuAddIntentsPayload,
  LuRemoveIntentsPayload,
  LuRemoveIntentPayload,
  LuUpdateIntentPayload,
} from './types';
// Wrapper class
class LuWorker extends BaseWorker<LuActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<LuParsePayload>(LuActionType.Parse, payload);
  }

  addIntent(luFile: LuFile, intent: LuIntentSection) {
    const payload = { luFile, intent };
    return this.sendMsg<LuAddIntentPayload>(LuActionType.AddIntent, payload);
  }

  updateIntent(luFile: LuFile, intentName: string, intent?: { Name?: string; Body?: string }) {
    const payload = { luFile, intentName, intent };
    return this.sendMsg<LuUpdateIntentPayload>(LuActionType.UpdateIntent, payload);
  }

  removeIntent(luFile: LuFile, intentName: string) {
    const payload = { luFile, intentName };
    return this.sendMsg<LuRemoveIntentPayload>(LuActionType.RemoveIntent, payload);
  }

  addIntents(luFile: LuFile, intents: LuIntentSection[]) {
    const payload = { luFile, intents };
    return this.sendMsg<LuAddIntentsPayload>(LuActionType.AddIntents, payload);
  }

  removeIntents(luFile: LuFile, intentNames: string[]) {
    const payload = { luFile, intentNames };
    return this.sendMsg<LuRemoveIntentsPayload>(LuActionType.RemoveIntents, payload);
  }
}

export default new LuWorker(new Worker());
