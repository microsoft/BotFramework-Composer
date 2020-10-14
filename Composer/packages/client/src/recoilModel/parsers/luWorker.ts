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
  parse(id: string, content: string, luFeatures) {
    const payload = { id, content, luFeatures };
    return this.sendMsg<LuParsePayload>(LuActionType.Parse, payload);
  }

  addIntent(luFile: LuFile, intent: LuIntentSection, luFeatures) {
    const payload = { luFile, intent, luFeatures };
    return this.sendMsg<LuAddIntentPayload>(LuActionType.AddIntent, payload);
  }

  updateIntent(luFile: LuFile, intentName: string, intent: { Name?: string; Body?: string }, luFeatures) {
    const payload = { luFile, intentName, intent, luFeatures };
    return this.sendMsg<LuUpdateIntentPayload>(LuActionType.UpdateIntent, payload);
  }

  removeIntent(luFile: LuFile, intentName: string, luFeatures) {
    const payload = { luFile, intentName, luFeatures };
    return this.sendMsg<LuRemoveIntentPayload>(LuActionType.RemoveIntent, payload);
  }

  addIntents(luFile: LuFile, intents: LuIntentSection[], luFeatures) {
    const payload = { luFile, intents, luFeatures };
    return this.sendMsg<LuAddIntentsPayload>(LuActionType.AddIntents, payload);
  }

  removeIntents(luFile: LuFile, intentNames: string[], luFeatures) {
    const payload = { luFile, intentNames, luFeatures };
    return this.sendMsg<LuRemoveIntentsPayload>(LuActionType.RemoveIntents, payload);
  }
}

export default new LuWorker(new Worker());
