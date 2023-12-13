// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { lgUtil } from '@bfc/indexers';
import { lgImportResolverGenerator, LgFile } from '@bfc/shared';

import {
  LgActionType,
  LgEventType,
  LgParsePayload,
  LgUpdateTemplatePayload,
  LgCreateTemplatePayload,
  LgCreateTemplatesPayload,
  LgRemoveTemplatePayload,
  LgRemoveAllTemplatesPayload,
  LgCopyTemplatePayload,
  LgNewCachePayload,
  LgCleanCachePayload,
  LgParseAllPayload,
} from '../types';
import { MapOptimizer } from '../../utils/mapOptimizer';

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

type ParseAllMessage = {
  id: string;
  type: LgActionType.ParseAll;
  payload: LgParseAllPayload;
};

type LgMessageEvent =
  | NewCacheMessage
  | CleanCacheMeassage
  | ParseMessage
  | AddMessage
  | AddsMessage
  | UpdateMessage
  | RemoveMessage
  | RemoveAllMessage
  | CopyMessage
  | ParseAllMessage;

type LgResources = Map<string, LgFile>;

const lgFileResolver = (lgFiles) => {
  return lgImportResolverGenerator(lgFiles, '.lg');
};

export class LgCache {
  // use projectId to support multiple bots.
  projects: Map<string, LgResources> = new Map();

  public set(projectId: string, value: LgFile) {
    const lgResources = this.projects.get(projectId);

    if (!lgResources) return;

    lgResources.set(value.id, value);

    // update reference resource
    const updatedResource = value.parseResult;
    lgResources.forEach((lgResource) => {
      if (lgResource.parseResult) {
        lgResource.parseResult.references = lgResource.parseResult.references.map((ref) => {
          return ref.id === value.id ? updatedResource : ref;
        });
      }
    });

    this.projects.set(projectId, lgResources);
  }

  public get(projectId: string, fileId: string) {
    return this.projects.get(projectId)?.get(fileId);
  }

  public removeProject(projectId: string) {
    this.projects.delete(projectId);
  }

  public addProject(projectId: string) {
    const lgResources = new Map();
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

const getTargetFile = (projectId: string, lgFile: LgFile, lgFiles: LgFile[]) => {
  const cachedFile = cache.get(projectId, lgFile.id);

  if (cachedFile?.isContentUnparsed) {
    const lgFile = lgUtil.parse(cachedFile.id, cachedFile.content, lgFiles);
    lgFile.isContentUnparsed = false;
    cache.set(projectId, lgFile);
    return filterParseResult(lgFile);
  }

  // Instead of compare content, just use cachedFile as single truth of fact, because all updates are supposed to be happen in worker, and worker will always update cache.
  return cachedFile ?? lgFile;
};

const emptyLgFile = (id: string, content: string): LgFile => {
  return {
    id,
    content,
    diagnostics: [],
    templates: [],
    allTemplates: [],
    imports: [],
    isContentUnparsed: true,
  };
};

export const handleMessage = (msg: LgMessageEvent) => {
  let payload: any = null;
  switch (msg.type) {
    case LgActionType.NewCache: {
      const { projectId } = msg.payload;
      cache.addProject(projectId);
      break;
    }

    case LgActionType.CleanCache: {
      const { projectId } = msg.payload;
      cache.removeProject(projectId);
      break;
    }

    case LgActionType.Parse: {
      const { id, content, lgFiles, projectId } = msg.payload;

      const cachedFile = cache.get(projectId, id);
      if (cachedFile?.isContentUnparsed === false && cachedFile?.content === content) {
        return filterParseResult(cachedFile);
      }

      const lgFile = lgUtil.parse(id, content, lgFiles);
      cache.set(projectId, lgFile);
      payload = filterParseResult(lgFile);
      break;
    }

    case LgActionType.ParseAll: {
      const { lgResources, projectId } = msg.payload;
      // We'll do the parsing when the file is required. Save empty LG instead.
      payload = lgResources.map(({ id, content }) => [id, emptyLgFile(id, content)]);
      const resources = new Map<string, LgFile>(payload);
      cache.projects.set(projectId, resources);

      const optimizer = new MapOptimizer(10, resources);
      optimizer.onUpdate((_, value, ctx) => {
        const refs = value.parseResult?.references?.map(({ name }) => name);
        ctx.setReferences(refs);
      });
      optimizer.onDelete((_, value) => {
        const lgFile = emptyLgFile(value.id, value.content);
        cache.set(projectId, lgFile);
        ctx.postMessage({ type: LgEventType.OnUpdateLgFile, projectId, payload: lgFile });
      });
      break;
    }

    case LgActionType.AddTemplate: {
      const { lgFile, template, lgFiles, projectId } = msg.payload;
      const result = lgUtil.addTemplate(getTargetFile(projectId, lgFile, lgFiles), template, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.AddTemplates: {
      const { lgFile, templates, lgFiles, projectId } = msg.payload;
      const result = lgUtil.addTemplates(getTargetFile(projectId, lgFile, lgFiles), templates, lgFileResolver(lgFiles));
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.UpdateTemplate: {
      const { lgFile, templateName, template, lgFiles, projectId } = msg.payload;
      const result = lgUtil.updateTemplate(
        getTargetFile(projectId, lgFile, lgFiles),
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
      const result = lgUtil.removeTemplate(
        getTargetFile(projectId, lgFile, lgFiles),
        templateName,
        lgFileResolver(lgFiles)
      );
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.RemoveAllTemplates: {
      const { lgFile, templateNames, lgFiles, projectId } = msg.payload;
      const result = lgUtil.removeTemplates(
        getTargetFile(projectId, lgFile, lgFiles),
        templateNames,
        lgFileResolver(lgFiles)
      );
      cache.set(projectId, result);
      payload = filterParseResult(result);
      break;
    }

    case LgActionType.CopyTemplate: {
      const { lgFile, toTemplateName, fromTemplateName, lgFiles, projectId } = msg.payload;
      const result = lgUtil.copyTemplate(
        getTargetFile(projectId, lgFile, lgFiles),
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
    ctx.postMessage({ id: msg.id, error: error.message });
  }
};
