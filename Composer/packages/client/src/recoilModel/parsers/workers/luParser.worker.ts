// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luUtil } from '@bfc/indexers';

import {
  LuActionType,
  LuParsePayload,
  LuRemoveIntentsPayload,
  LuRemoveIntentPayload,
  LuUpdateIntentPayload,
  LuAddIntentsPayload,
  LuAddIntentPayload,
} from '../types';
const ctx: Worker = self as any;

interface ParseMessage {
  id: string;
  type: LuActionType.Parse;
  payload: LuParsePayload;
}

interface AddMessage {
  id: string;
  type: LuActionType.AddIntent;
  payload: LuAddIntentPayload;
}

interface AddsMessage {
  id: string;
  type: LuActionType.AddIntents;
  payload: LuAddIntentsPayload;
}

interface UpdateMessage {
  id: string;
  type: LuActionType.UpdateIntent;
  payload: LuUpdateIntentPayload;
}

interface RemoveMessage {
  id: string;
  type: LuActionType.RemoveIntent;
  payload: LuRemoveIntentPayload;
}

interface RemoveIntentsMessage {
  id: string;
  type: LuActionType.RemoveIntents;
  payload: LuRemoveIntentsPayload;
}

type LuMessageEvent = ParseMessage | AddMessage | AddsMessage | UpdateMessage | RemoveMessage | RemoveIntentsMessage;

export const handleMessage = (msg: LuMessageEvent) => {
  let result: any = null;
  switch (msg.type) {
    case LuActionType.Parse: {
      const { id, content, luFeatures } = msg.payload;
      result = luUtil.parse(id, content, luFeatures);
      break;
    }

    case LuActionType.AddIntent: {
      const { luFile, intent, luFeatures } = msg.payload;
      result = luUtil.addIntent(luFile, intent, luFeatures);
      break;
    }

    case LuActionType.AddIntents: {
      const { luFile, intents, luFeatures } = msg.payload;
      result = luUtil.addIntents(luFile, intents, luFeatures);
      break;
    }

    case LuActionType.UpdateIntent: {
      const { luFile, intentName, intent, luFeatures } = msg.payload;
      result = luUtil.updateIntent(luFile, intentName, intent || null, luFeatures);
      break;
    }

    case LuActionType.RemoveIntent: {
      const { luFile, intentName, luFeatures } = msg.payload;
      result = luUtil.removeIntent(luFile, intentName, luFeatures);
      break;
    }

    case LuActionType.RemoveIntents: {
      const { luFile, intentNames, luFeatures } = msg.payload;
      result = luUtil.removeIntents(luFile, intentNames, luFeatures);
      break;
    }
  }
  return result;
};

ctx.onmessage = function (msg) {
  const { id } = msg.data;
  try {
    const payload = handleMessage(msg.data as LuMessageEvent);

    ctx.postMessage({ id, payload });
  } catch (error) {
    ctx.postMessage({ id, error: error.message });
  }
};
