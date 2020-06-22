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
  targetId: string;
  content: string;
  lgFiles: LgFile[];
};

export interface LgCreateTemplatePayload {
  content: string;
  template: LgTemplate;
}

export interface LgUpdateTemplatePayload {
  content: string;
  templateName: string;
  template: LgTemplate;
}

export interface LgRemoveTemplatePayload {
  content: string;
  templateName: string;
}

export interface LgRemoveAllTemplatesPayload {
  content: string;
  templateNames: string[];
}

export interface LgCopyTemplatePayload {
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
}

export enum LgActionType {
  Parse = 'parse',
  AddTemplate = 'add-template',
  UpdateTemplate = 'update-template',
  RemoveTemplate = 'remove-template',
  RemoveAllTemplates = 'remove-all-templates',
  CopyTemplate = 'copy-template',
}

export enum IndexerActionType {
  Index = 'index',
}
