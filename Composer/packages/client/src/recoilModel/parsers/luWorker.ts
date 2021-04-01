// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LuFile, TextFile } from '@bfc/shared';

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
  LuParseAllPayload,
} from './types';
// Wrapper class
class LuWorker extends BaseWorker<LuActionType> {
  parse(id: string, content: string, luFeatures, luFiles: LuFile[]) {
    const payload = { id, content, luFeatures, luFiles };
    return this.sendMsg<LuParsePayload>(LuActionType.Parse, payload);
  }

  parseAll(luResources: TextFile[], luFeatures) {
    const payload = { luResources, luFeatures };
    return this.sendMsg<LuParseAllPayload>(LuActionType.ParseAll, payload);
  }

  addIntent(luFile: LuFile, intent: LuIntentSection, luFeatures, luFiles: LuFile[]) {
    const payload = { luFile, intent, luFeatures, luFiles };
    return this.sendMsg<LuAddIntentPayload>(LuActionType.AddIntent, payload);
  }

  updateIntent(
    luFile: LuFile,
    intentName: string,
    intent: { Name?: string; Body?: string },
    luFeatures,
    luFiles: LuFile[]
  ) {
    const payload = { luFile, intentName, intent, luFeatures, luFiles };
    return this.sendMsg<LuUpdateIntentPayload>(LuActionType.UpdateIntent, payload);
  }

  removeIntent(luFile: LuFile, intentName: string, luFeatures, luFiles: LuFile[]) {
    const payload = { luFile, intentName, luFeatures, luFiles };
    return this.sendMsg<LuRemoveIntentPayload>(LuActionType.RemoveIntent, payload);
  }

  addIntents(luFile: LuFile, intents: LuIntentSection[], luFeatures, luFiles: LuFile[]) {
    const payload = { luFile, intents, luFeatures, luFiles };
    return this.sendMsg<LuAddIntentsPayload>(LuActionType.AddIntents, payload);
  }

  removeIntents(luFile: LuFile, intentNames: string[], luFeatures, luFiles: LuFile[]) {
    const payload = { luFile, intentNames, luFeatures, luFiles };
    return this.sendMsg<LuRemoveIntentsPayload>(LuActionType.RemoveIntents, payload);
  }
}

export default new LuWorker(new Worker());
