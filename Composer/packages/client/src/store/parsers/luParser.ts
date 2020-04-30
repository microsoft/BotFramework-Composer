// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Worker from 'worker-loader!./workers/luParser.worker.ts';
import { LuIntentSection } from '@bfc/shared';

import { BaseParser } from './baseParser';

export type LuPayload = {
  targetId: string;
  content: string;
};

export type IntentPayload = {
  content: string;
  intentName?: string;
  intent?: LuIntentSection | null;
};

export enum LuActionType {
  Parse = 'parse',
  AddIntent = 'add-intent',
  UpdateIntent = 'update-intent',
  RemoveIntent = 'remove-intent',
}

// Wrapper class
class LuParser extends BaseParser {
  parse(targetId: string, content: string) {
    return this.sendMsg<LuPayload>(LuActionType.Parse, { targetId, content });
  }

  addIntent(content: string, intent: LuIntentSection) {
    return this.sendMsg<IntentPayload>(LuActionType.AddIntent, { content, intent });
  }

  updateIntent(content: string, intentName: string, intent: LuIntentSection | null) {
    return this.sendMsg<IntentPayload>(LuActionType.UpdateIntent, { content, intentName, intent });
  }

  removeIntent(content: string, intentName: string) {
    return this.sendMsg<IntentPayload>(LuActionType.RemoveIntent, { content, intentName });
  }
}

export default new LuParser(new Worker());
