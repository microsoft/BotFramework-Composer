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
      const { id, content } = msg.payload;
      result = luUtil.parse(id, content);
      break;
    }

    case LuActionType.AddIntent: {
      const { luFile, intent } = msg.payload;
      result = luUtil.addIntent(luFile, intent);
      break;
    }

    case LuActionType.AddIntents: {
      const { luFile, intents } = msg.payload;
      result = luUtil.addIntents(luFile, intents);
      break;
    }

    case LuActionType.UpdateIntent: {
      const { luFile, intentName, intent } = msg.payload;
      result = luUtil.updateIntent(luFile, intentName, intent || null);
      break;
    }

    case LuActionType.RemoveIntent: {
      const { luFile, intentName } = msg.payload;
      result = luUtil.removeIntent(luFile, intentName);
      break;
    }

    case LuActionType.RemoveIntents: {
      const { luFile, intentNames } = msg.payload;
      result = luUtil.removeIntents(luFile, intentNames);
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
    ctx.postMessage({ id, error });
  }
};
