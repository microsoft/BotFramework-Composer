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
  LgRemoveTemplatePayload,
  LgRemoveAllTemplatesPayload,
  LgCopyTemplatePayload,
} from './types';

// Wrapper class
class LgWorker extends BaseWorker<LgActionType> {
  parse(targetId: string, content: string, lgFiles: LgFile[]) {
    return this.sendMsg<LgParsePayload>(LgActionType.Parse, { targetId, content, lgFiles: lgFiles });
  }

  addTemplate(content: string, template: LgTemplate) {
    return this.sendMsg<LgCreateTemplatePayload>(LgActionType.AddTemplate, { content, template });
  }

  updateTemplate(content: string, templateName: string, template: LgTemplate) {
    return this.sendMsg<LgUpdateTemplatePayload>(LgActionType.UpdateTemplate, { content, templateName, template });
  }

  removeTemplate(content: string, templateName: string) {
    return this.sendMsg<LgRemoveTemplatePayload>(LgActionType.RemoveTemplate, { content, templateName });
  }

  removeAllTemplates(content: string, templateNames: string[]) {
    return this.sendMsg<LgRemoveAllTemplatesPayload>(LgActionType.RemoveAllTemplates, { content, templateNames });
  }

  copyTemplate(content: string, fromTemplateName: string, toTemplateName: string) {
    return this.sendMsg<LgCopyTemplatePayload>(LgActionType.CopyTemplate, {
      content,
      fromTemplateName,
      toTemplateName,
    });
  }
}

export default new LgWorker(new Worker());
