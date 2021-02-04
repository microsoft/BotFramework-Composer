// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LgFile, LuFile, QnASection, FileInfo, LgTemplate, ILUFeaturesConfig } from '@bfc/shared';

import { FileAsset } from '../persistence/types';

export type LuParsePayload = {
  id: string;
  content: string;
  luFeatures: ILUFeaturesConfig;
};

export type LuIndexPayload = {
  projectId: string;
  id: string;
  rawLuFiles: FileInfo[];
  luFeatures: ILUFeaturesConfig;
};

export type LuAddIntentPayload = {
  luFile: LuFile;
  intent: LuIntentSection;
  luFeatures: ILUFeaturesConfig;
};

export type LuAddIntentsPayload = {
  luFile: LuFile;
  intents: LuIntentSection[];
  luFeatures: ILUFeaturesConfig;
};

export type LuUpdateIntentPayload = {
  luFile: LuFile;
  intentName: string;
  intent?: { Name?: string; Body?: string };
  luFeatures: ILUFeaturesConfig;
};

export type LuRemoveIntentPayload = {
  luFile: LuFile;
  intentName: string;
  luFeatures: ILUFeaturesConfig;
};

export type LuRemoveIntentsPayload = {
  luFile: LuFile;
  intentNames: string[];
  luFeatures: ILUFeaturesConfig;
};

export type LgParsePayload = {
  projectId: string;
  id: string;
  content: string;
  lgFiles: LgFile[];
};

export type LgIndexPayload = {
  projectId: string;
  id: string;
  rawLgFiles: FileInfo[];
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
  luFeatures: { key: string; value: boolean };
};

export type QnAPayload = {
  content: string;
  id?: string;
  section?: QnASection;
};

export type QnAIndexPayload = {
  projectId: string;
  id: string;
  rawQnAFiles: FileInfo[];
};

export enum LuActionType {
  Parse = 'parse',
  Index = 'index',
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
  Index = 'index',
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
  Index = 'index',
  AddSection = 'add-section',
  UpdateSection = 'update-section',
  RemoveSection = 'remove-section',
}

export type FilesDifferencePayload = {
  target: FileAsset[];
  origin: FileAsset[];
};

export type CalculatorType = 'difference';
