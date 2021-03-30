// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LgFile, LuFile, FileInfo, LgTemplate, ILUFeaturesConfig, TextFile } from '@bfc/shared';

import { FileAsset } from '../persistence/types';

export type LuParsePayload = {
  id: string;
  content: string;
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
};

export type LuParseAllPayload = {
  luResources: TextFile[];
  luFeatures: ILUFeaturesConfig;
};

export type LuAddIntentPayload = {
  luFile: LuFile;
  intent: LuIntentSection;
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
};

export type LuAddIntentsPayload = {
  luFile: LuFile;
  intents: LuIntentSection[];
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
};

export type LuUpdateIntentPayload = {
  luFile: LuFile;
  intentName: string;
  intent?: { Name?: string; Body?: string };
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
};

export type LuRemoveIntentPayload = {
  luFile: LuFile;
  intentName: string;
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
};

export type LuRemoveIntentsPayload = {
  luFile: LuFile;
  intentNames: string[];
  luFeatures: ILUFeaturesConfig;
  luFiles: LuFile[];
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
}

export interface LgCleanCachePayload {
  projectId: string;
}

export type LgParseAllPayload = {
  projectId: string;
  lgResources: TextFile[];
};

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
  luFeatures: { key: string; value: boolean };
};

export type QnAParsePayload = {
  content: string;
  id: string;
};

export type QnAParseAllPayload = {
  qnaResources: TextFile[];
};

export enum LuActionType {
  Parse = 'parse',
  AddIntent = 'add-intent',
  UpdateIntent = 'update-intent',
  RemoveIntent = 'remove-intent',
  AddIntents = 'add-intents',
  RemoveIntents = 'remove-intents',
  ParseAll = 'parse-all',
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
  ParseAll = 'parse-all',
}

export enum IndexerActionType {
  Index = 'index',
}

export enum QnAActionType {
  Parse = 'parse',
  ParseAll = 'parse-all',
}

export type FilesDifferencePayload = {
  target: FileAsset[];
  origin: FileAsset[];
};

export type CalculatorType = 'difference';
