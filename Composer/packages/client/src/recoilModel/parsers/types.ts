// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LgFile, LuFile, QnASection, FileInfo, LgTemplate } from '@bfc/shared';

export type LuParsePayload = {
  id: string;
  content: string;
};

export type LuAddIntentPayload = {
  luFile: LuFile;
  intent: LuIntentSection;
};

export type LuAddIntentsPayload = {
  luFile: LuFile;
  intents: LuIntentSection[];
};

export type LuUpdateIntentPayload = {
  luFile: LuFile;
  intentName: string;
  intent?: { Name?: string; Body?: string };
};

export type LuRemoveIntentPayload = {
  luFile: LuFile;
  intentName: string;
};

export type LuRemoveIntentsPayload = {
  luFile: LuFile;
  intentNames: string[];
};

export type LgParsePayload = {
  projectId: string;
  id: string;
  content: string;
  lgFiles: LgFile[];
};

export interface LgCreateTemplatePayload {
  projectId: string;
  lgFile: LgFile;
  template: LgTemplate;
  lgFiles: LgFile[];
}

export interface LgCreateTemplatesPayload {
  projectId: string;
  lgFile: LgFile;
  templates: LgTemplate[];
  lgFiles: LgFile[];
}

export interface LgUpdateTemplatePayload {
  projectId: string;
  lgFile: LgFile;
  templateName: string;
  template: { name?: string; parameters?: string[]; body?: string };
  lgFiles: LgFile[];
}

export interface LgRemoveTemplatePayload {
  projectId: string;
  lgFile: LgFile;
  templateName: string;
  lgFiles: LgFile[];
}

export interface LgRemoveAllTemplatesPayload {
  projectId: string;
  lgFile: LgFile;
  templateNames: string[];
  lgFiles: LgFile[];
}

export interface LgNewCachePayload {
  projectId: string;
  lgFiles: LgFile[];
}

export interface LgCleanCachePayload {
  projectId: string;
}

export interface LgCopyTemplatePayload {
  projectId: string;
  lgFile: LgFile;
  fromTemplateName: string;
  toTemplateName: string;
  lgFiles: LgFile[];
}

export type IndexPayload = {
  files: FileInfo;
  botName: string;
  schemas: any;
  locale: string;
};

export type QnAPayload = {
  content: string;
  id?: string;
  section?: QnASection;
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
  CleanCache = 'clean',
  NewCache = 'new',
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

export enum QnAActionType {
  Parse = 'parse',
  AddSection = 'add-section',
  UpdateSection = 'update-section',
  RemoveSection = 'remove-section',
}
