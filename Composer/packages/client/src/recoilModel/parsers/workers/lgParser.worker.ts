// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { lgUtil } from '@bfc/indexers';
import { importResolverGenerator, LgFile } from '@bfc/shared';

import {
  LgActionType,
  LgParsePayload,
  LgUpdateTemplatePayload,
  LgCreateTemplatePayload,
  LgCreateTemplatesPayload,
  LgRemoveTemplatePayload,
  LgRemoveAllTemplatesPayload,
  LgCopyTemplatePayload,
  LgNewCachePayload,
  LgCleanCachePayload,
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

interface CopyMessage {
  id: string;
  type: LgActionType.CopyTemplate;
  payload: LgCopyTemplatePayload;
}

interface NewCacheMessage {
  id: string;
  type: LgActionType.NewCache;
  payload: LgNewCachePayload;
}

interface CleanCacheMeassage {
  id: string;
  type: LgActionType.CleanCache;
  payload: LgCleanCachePayload;
}

type LgMessageEvent =
  | NewCacheMessage
  | CleanCacheMeassage
  | ParseMessage
  | AddMessage
  | AddsMessage
  | UpdateMessage
  | RemoveMessage
  | RemoveAllMessage
  | CopyMessage;

type LgResources = Map<string, LgFile>;

const lgFileResolver = (lgFiles) => {
  return importResolverGenerator(lgFiles, '.lg');
};

export class LgCache {
  // use projectId to support multiple bots.
  projects: Map<string, LgResources> = new Map();

  public set(projectId: string, value: LgFile) {
    const lgResources = this.projects.get(projectId);

    if (!lgResources) return;

    lgResources.set(value.id, value);
    this.projects.set(projectId, lgResources);
  }

  public get(projectId: string, fileId: string) {
    return this.projects.get(projectId)?.get(fileId);
  }

  public removeProject(projectId: string) {
    this.projects.delete(projectId);
  }

  public addProject(projectId: string, lgFiles: LgFile[]) {
    const lgResources = new Map();
    lgFiles.forEach((file) => {
      lgResources.set(file.id, lgUtil.parse(file.id, file.content, lgFiles));
    });
    this.projects.set(projectId, lgResources);
  }
}

// cache the lg parse result. For updateTemplate function,
// if we use the cache, the 12k lines file will reduce the parse time(10s -> 150ms)
export const cache = new LgCache();

const filterParseResult = (lgFile: LgFile) => {
  const cloned = { ...lgFile };
  // remove the parse tree from the result.
  // The parse tree has Int32Array type, can't be frozen by recoil
  delete cloned.parseResult;
  return cloned;
};

const getTargetFile = (projectId: string, lgFile: LgFile) => {
  const cachedFile = cache.get(projectId, lgFile.id);

  return !cachedFile || cachedFile.content !== lgFile.content ? lgFile : cachedFile;
};

export const handleMessage = (msg: LgMessageEvent) => {
  let payload: any = null;
  switch (msg.type) {
    case LgActionType.NewCache: {
      const { projectId, lgFiles } = msg.payload;
      cache.addProject(projectId, lgFiles);
      break;
    }

    case LgActionType.CleanCache: {
      const { projectId } = msg.payload;
      cache.removeProject(projectId);
      break;
    }

    case LgActionType.Parse: {
      const { id, content, lgFiles, projectId } = msg.payload;

      const lgFile = lgUtil.parse(id, content, lgFiles);
      cache.set(projectId, lgFile);
      payload = filterParseResult(lgFile);
      break;
    }

    case LgActionType.AddTemplate: {
      const { lgFile, template, lgFiles, projectId } = msg.payload;
      const result = lgUtil.addTemplate(getTargetFile(projectId, lgFile), template, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.AddTemplates: {
      const { lgFile, templates, lgFiles, projectId } = msg.payload;
      const result = lgUtil.addTemplates(getTargetFile(projectId, lgFile), templates, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.UpdateTemplate: {
      const { lgFile, templateName, template, lgFiles, projectId } = msg.payload;
      const result = lgUtil.updateTemplate(
        getTargetFile(projectId, lgFile),
        templateName,
        template,
        lgFileResolver(lgFiles)
      );
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.RemoveTemplate: {
      const { lgFile, templateName, lgFiles, projectId } = msg.payload;
      const result = lgUtil.removeTemplate(getTargetFile(projectId, lgFile), templateName, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.RemoveAllTemplates: {
      const { lgFile, templateNames, lgFiles, projectId } = msg.payload;
      const result = lgUtil.removeTemplates(getTargetFile(projectId, lgFile), templateNames, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.CopyTemplate: {
      const { lgFile, toTemplateName, fromTemplateName, lgFiles, projectId } = msg.payload;
      const result = lgUtil.copyTemplate(
        getTargetFile(projectId, lgFile),
        fromTemplateName,
        toTemplateName,
        lgFileResolver(lgFiles)
      );
      cache.set(projectId, result);
      payload = filterParseResult(result);
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
