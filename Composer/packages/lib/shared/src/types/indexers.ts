// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, Range } from './diagnostic';
import { IIntentTrigger } from './dialogUtils';

import { DialogSetting } from './index';

export enum FileExtensions {
  Dialog = '.dialog',
  DialogSchema = '.schema',
  Manifest = '.json',
  Lu = '.lu',
  Lg = '.lg',
  Qna = '.qna',
  Setting = 'appsettings.json',
  FormDialogSchema = '.form-dialog',
}

export interface FileInfo {
  name: string;
  content: string;
  path: string;
  relativePath: string;
  lastModified: string;
}

export interface ITrigger {
  id: string;
  displayName: string;
  type: string;
  isIntent: boolean;
}

export interface ReferredLuIntents {
  name: string;
  path: string;
}

export interface DialogSchemaFile {
  id: string;
  content: any;
}

export interface DialogInfo {
  content: any;
  diagnostics: Diagnostic[];
  displayName: string;
  id: string;
  isRoot: boolean;
  lgFile: string;
  lgTemplates: LgTemplateJsonPath[];
  luFile: string;
  qnaFile: string;
  referredLuIntents: ReferredLuIntents[];
  referredDialogs: string[];
  triggers: ITrigger[];
  intentTriggers: IIntentTrigger[];
  skills: string[];
}

export interface LgTemplateJsonPath {
  name: string;
  path: string;
}

export interface Intent {
  name: string;
}

export interface Utterance {
  intent: string;
  text: string;
}

export interface LuIntentSection {
  Name: string;
  Body: string;
  Entities?: LuEntity[];
  Children?: LuIntentSection[];
  range?: Range;
}

export interface LuParsed {
  empty: boolean;
  intents: LuIntentSection[];
  diagnostics: Diagnostic[];
}

export enum LuSectionTypes {
  SIMPLEINTENTSECTION = 'simpleIntentSection',
  NESTEDINTENTSECTION = 'nestedIntentSection',
  MODELINFOSECTION = 'modelInfoSection',
}

export interface LuEntity {
  Name: string;
}

export interface LuFile {
  id: string;
  content: string;
  diagnostics: Diagnostic[];
  intents: LuIntentSection[];
  empty: boolean;
  [key: string]: any;
}

export interface QnASection {
  Questions: { content: string; id: string }[];
  Answer: string;
  Body: string;
}

export interface QnAFile {
  id: string;
  content: string;
  qnaSections: QnASection[];
  [key: string]: any;
}

export interface LgTemplate {
  name: string;
  body: string;
  parameters: string[];
  range?: Range;
}

export interface LgParsed {
  diagnostics: Diagnostic[];
  templates: LgTemplate[];
}

export interface LgFile {
  id: string;
  content: string;
  diagnostics: Diagnostic[];
  templates: LgTemplate[];
  allTemplates: LgTemplate[];
  options?: string[];
  parseResult?: any;
}

export interface Skill {
  id: string;
  content: any;
  description?: string;
  endpoints: any[];
  endpointUrl: string;
  manifestUrl: string;
  msAppId: string;
  name: string;
}

export interface TextFile {
  id: string;
  content: string;
}
export type FileResolver = (id: string) => FileInfo | undefined;

export type MemoryResolver = (id: string) => string[] | undefined;

export interface SkillManifestInfo {
  content: { [key: string]: any };
  lastModified: string;
  id: string;
}

export interface SkillManifest {
  content: any;
  id: string;
  path?: string;
  lastModified?: string;
}

export type BotAssets = {
  projectId: string;
  dialogs: DialogInfo[];
  luFiles: LuFile[];
  lgFiles: LgFile[];
  qnaFiles: QnAFile[];
  skillManifests: SkillManifest[];
  setting: DialogSetting;
  dialogSchemas: DialogSchemaFile[];
  botProjectFile: BotProjectFile;
};

export interface BotInfo {
  assets: BotAssets;
  diagnostics: Diagnostic[];
  name: string;
}

export interface BotProjectSpaceSkill {
  workspace?: string;
  manifest?: string;
  remote: boolean;
  endpointName?: string;
  name: string;
}

export interface BotProjectSpace {
  workspace: string;
  name: string;
  skills: BotProjectSpaceSkill[];
}

export interface BotProjectFile {
  id: string;
  content: BotProjectSpace;
  lastModified: string;
}
