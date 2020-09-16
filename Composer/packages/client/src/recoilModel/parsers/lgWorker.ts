// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile, LgTemplate } from '@bfc/shared';

import Worker from './workers/lgParser.worker.ts';
import { BaseWorker } from './baseWorker';
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
} from './types';

// Wrapper class
class LgWorker extends BaseWorker<LgActionType> {
  addProject(projectId: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgNewCachePayload>(LgActionType.NewCache, { projectId, lgFiles });
  }

  removeProject(projectId: string) {
    return this.sendMsg<LgCleanCachePayload>(LgActionType.CleanCache, { projectId });
  }

  parse(projectId: string, id: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgParsePayload>(LgActionType.Parse, { id, content, lgFiles, projectId });
  }

  addTemplate(projectId: string, lgFile: LgFile, template: LgTemplate, lgFiles: LgFile[]) {
    return this.sendMsg<LgCreateTemplatePayload>(LgActionType.AddTemplate, { lgFile, template, lgFiles, projectId });
  }

  addTemplates(projectId: string, lgFile: LgFile, templates: LgTemplate[], lgFiles: LgFile[]) {
    return this.sendMsg<LgCreateTemplatesPayload>(LgActionType.AddTemplates, { lgFile, templates, lgFiles, projectId });
  }

  updateTemplate(
    projectId: string,
    lgFile: LgFile,
    templateName: string,
    template: { name?: string; parameters?: string[]; body?: string },
    lgFiles: LgFile[]
  ) {
    return this.sendMsg<LgUpdateTemplatePayload>(LgActionType.UpdateTemplate, {
      lgFile,
      templateName,
      template,
      lgFiles,
      projectId,
    });
  }

  removeTemplate(projectId: string, lgFile: LgFile, templateName: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgRemoveTemplatePayload>(LgActionType.RemoveTemplate, {
      lgFile,
      templateName,
      lgFiles,
      projectId,
    });
  }

  removeTemplates(projectId: string, lgFile: LgFile, templateNames: string[], lgFiles: LgFile[]) {
    return this.sendMsg<LgRemoveAllTemplatesPayload>(LgActionType.RemoveAllTemplates, {
      lgFile,
      templateNames,
      lgFiles,
      projectId,
    });
  }

  copyTemplate(projectId: string, lgFile: LgFile, fromTemplateName: string, toTemplateName: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgCopyTemplatePayload>(LgActionType.CopyTemplate, {
      lgFile,
      fromTemplateName,
      toTemplateName,
      lgFiles,
      projectId,
    });
  }
}

export default new LgWorker(new Worker());
