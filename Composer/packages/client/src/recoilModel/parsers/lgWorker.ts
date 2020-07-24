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
} from './types';

// Wrapper class
class LgWorker extends BaseWorker<LgActionType> {
  parse(id: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgParsePayload>(LgActionType.Parse, { id, content, lgFiles: lgFiles });
  }

  addTemplate(id: string, content: string, template: LgTemplate) {
    return this.sendMsg<LgCreateTemplatePayload>(LgActionType.AddTemplate, { id, content, template });
  }

  addTemplates(id: string, content: string, templates: LgTemplate[]) {
    return this.sendMsg<LgCreateTemplatesPayload>(LgActionType.AddTemplates, { id, content, templates });
  }

  updateTemplate(id: string, content: string, templateName: string, template: LgTemplate) {
    return this.sendMsg<LgUpdateTemplatePayload>(LgActionType.UpdateTemplate, { id, content, templateName, template });
  }

  removeTemplate(id: string, content: string, templateName: string) {
    return this.sendMsg<LgRemoveTemplatePayload>(LgActionType.RemoveTemplate, { id, content, templateName });
  }

  removeTemplates(id: string, content: string, templateNames: string[]) {
    return this.sendMsg<LgRemoveAllTemplatesPayload>(LgActionType.RemoveAllTemplates, { id, content, templateNames });
  }

  copyTemplate(id: string, content: string, fromTemplateName: string, toTemplateName: string) {
    return this.sendMsg<LgCopyTemplatePayload>(LgActionType.CopyTemplate, {
      id,
      content,
      fromTemplateName,
      toTemplateName,
    });
  }
}

export default new LgWorker(new Worker());
