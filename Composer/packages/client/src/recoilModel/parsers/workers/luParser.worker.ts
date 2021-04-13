// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luUtil } from '@bfc/indexers';
import { luImportResolverGenerator } from '@bfc/shared';

import {
  LuActionType,
  LuParsePayload,
  LuRemoveIntentsPayload,
  LuRemoveIntentPayload,
  LuUpdateIntentPayload,
  LuAddIntentsPayload,
  LuAddIntentPayload,
  LuParseAllPayload,
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

type ParseAllMessage = {
  id: string;
  type: LuActionType.ParseAll;
  payload: LuParseAllPayload;
};

type LuMessageEvent =
  | ParseMessage
  | AddMessage
  | AddsMessage
  | UpdateMessage
  | RemoveMessage
  | RemoveIntentsMessage
  | ParseAllMessage;

const luFileResolver = (luFiles) => {
  return luImportResolverGenerator(luFiles, '.lu');
};

export const handleMessage = (msg: LuMessageEvent) => {
  let result: any = null;
  switch (msg.type) {
    case LuActionType.Parse: {
      const { id, content, luFeatures, luFiles } = msg.payload;
      result = luUtil.parse(id, content, luFeatures, luFiles);
      break;
    }

    case LuActionType.ParseAll: {
      const { luResources, luFeatures } = msg.payload;
      result = luResources.map(({ id, content }) => luUtil.parse(id, content, luFeatures, luResources));
      break;
    }

    case LuActionType.AddIntent: {
      const { luFile, intent, luFeatures, luFiles } = msg.payload;
      result = luUtil.addIntent(luFile, intent, luFeatures, luFileResolver(luFiles));
      break;
    }

    case LuActionType.AddIntents: {
      const { luFile, intents, luFeatures, luFiles } = msg.payload;
      result = luUtil.addIntents(luFile, intents, luFeatures, luFileResolver(luFiles));
      break;
    }

    case LuActionType.UpdateIntent: {
      const { luFile, intentName, intent, luFeatures, luFiles } = msg.payload;
      result = luUtil.updateIntent(luFile, intentName, intent || null, luFeatures, luFileResolver(luFiles));
      break;
    }

    case LuActionType.RemoveIntent: {
      const { luFile, intentName, luFeatures, luFiles } = msg.payload;
      result = luUtil.removeIntent(luFile, intentName, luFeatures, luFileResolver(luFiles));
      break;
    }

    case LuActionType.RemoveIntents: {
      const { luFile, intentNames, luFeatures, luFiles } = msg.payload;
      result = luUtil.removeIntents(luFile, intentNames, luFeatures, luFileResolver(luFiles));
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
