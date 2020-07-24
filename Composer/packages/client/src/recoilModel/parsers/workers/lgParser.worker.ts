// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { lgUtil } from '@bfc/indexers';

import {
  LgActionType,
  LgParsePayload,
  LgUpdateTemplatePayload,
  LgCreateTemplatePayload,
  LgCreateTemplatesPayload,
  LgRemoveTemplatePayload,
  LgRemoveAllTemplatesPayload,
  LgCopyTemplatePayload,
} from '../types';

const ctx: Worker = self as any;

interface ParseMessage {
  id: string;
  type: LgActionType.Parse;
  payload: LgParsePayload;
}

interface AddMessage {
  id: string;
  type: LgActionType.AddTemplate;
  payload: LgCreateTemplatePayload;
}

interface AddsMessage {
  id: string;
  type: LgActionType.AddTemplates;
  payload: LgCreateTemplatesPayload;
}

interface UpdateMessage {
  id: string;
  type: LgActionType.UpdateTemplate;
  payload: LgUpdateTemplatePayload;
}

interface RemoveMessage {
  id: string;
  type: LgActionType.RemoveTemplate;
  payload: LgRemoveTemplatePayload;
}

interface RemoveAllMessage {
  id: string;
  type: LgActionType.RemoveAllTemplates;
  payload: LgRemoveAllTemplatesPayload;
}

interface CopyMessage {
  id: string;
  type: LgActionType.CopyTemplate;
  payload: LgCopyTemplatePayload;
}

type LgMessageEvent =
  | ParseMessage
  | AddMessage
  | AddsMessage
  | UpdateMessage
  | RemoveMessage
  | RemoveAllMessage
  | CopyMessage;

export const handleMessage = (msg: LgMessageEvent) => {
  let payload: any = null;
  switch (msg.type) {
    case LgActionType.Parse: {
      const { id, content, lgFiles } = msg.payload;

      const { templates, diagnostics } = lgUtil.parse(id, content, lgFiles);
      payload = { id, content, templates, diagnostics };
      break;
    }
    case LgActionType.AddTemplate: {
      const { id, content, template } = msg.payload;
      payload = lgUtil.addTemplate(id, content, template);
      break;
    }
    case LgActionType.AddTemplates: {
      const { id, content, templates } = msg.payload;
      payload = lgUtil.addTemplates(id, content, templates);
      break;
    }
    case LgActionType.UpdateTemplate: {
      const { id, content, templateName, template } = msg.payload;
      lgUtil.checkSingleLgTemplate(template);
      payload = lgUtil.updateTemplate(id, content, templateName, template);
      break;
    }
    case LgActionType.RemoveTemplate: {
      const { id, content, templateName } = msg.payload;
      payload = lgUtil.removeTemplate(id, content, templateName);
      break;
    }
    case LgActionType.RemoveAllTemplates: {
      const { id, content, templateNames } = msg.payload;
      payload = lgUtil.removeTemplates(id, content, templateNames);
      break;
    }
    case LgActionType.CopyTemplate: {
      const { id, content, toTemplateName, fromTemplateName } = msg.payload;
      payload = lgUtil.copyTemplate(id, content, fromTemplateName, toTemplateName);
      break;
    }
  }
  return payload;
};

ctx.onmessage = function (event) {
  const msg = event.data as LgMessageEvent;

  try {
    const payload = handleMessage(msg);

    ctx.postMessage({ id: msg.id, payload });
  } catch (error) {
    ctx.postMessage({ id: msg.id, error });
  }
};
