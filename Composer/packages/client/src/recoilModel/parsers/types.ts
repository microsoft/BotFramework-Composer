// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LgFile, FileInfo, LgTemplate } from '@bfc/shared';

export type LuPayload = {
  content: string;
  id?: string;
  intentName?: string;
  intent?: LuIntentSection;
};

export type LgParsePayload = {
  id: string;
  content: string;
  lgFiles: LgFile[];
};

export interface LgCreateTemplatePayload {
  id: string;
  content: string;
  template: LgTemplate;
}

export interface LgCreateTemplatesPayload {
  id: string;
  content: string;
  templates: LgTemplate[];
}

export interface LgUpdateTemplatePayload {
  id: string;
  content: string;
  templateName: string;
  template: LgTemplate;
}

export interface LgRemoveTemplatePayload {
  id: string;
  content: string;
  templateName: string;
}

export interface LgRemoveAllTemplatesPayload {
  id: string;
  content: string;
  templateNames: string[];
}

export interface LgCopyTemplatePayload {
  id: string;
  content: string;
  fromTemplateName: string;
  toTemplateName: string;
}
export type IndexPayload = {
  files: FileInfo;
  botName: string;
  schemas: any;
  locale: string;
};

export enum LuActionType {
  Parse = 'parse',
  AddIntent = 'add-intent',
  UpdateIntent = 'update-intent',
  RemoveIntent = 'remove-intent',
  AddIntents = 'add-intents',
  RemoveIntents = 'remove-intents',
}

export enum LgActionType {
  Parse = 'parse',
  AddTemplate = 'add-template',
  AddTemplates = 'add-templates',
  UpdateTemplate = 'update-template',
  RemoveTemplate = 'remove-template',
  RemoveAllTemplates = 'remove-all-templates',
  CopyTemplate = 'copy-template',
}

export enum IndexerActionType {
  Index = 'index',
}
