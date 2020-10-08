// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDiagnostic, IRange } from './diagnostic';
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
  BotProject = '.botproj',
}

export type FileInfo = {
  name: string;
  content: string;
  path: string;
  relativePath: string;
  lastModified: string;
};

export type ITrigger = {
  id: string;
  displayName: string;
  type: string;
  isIntent: boolean;
};

export type ReferredLuIntents = {
  name: string;
  path: string;
};

export type DialogSchemaFile = {
  id: string;
  content: any;
};

export type DialogInfo = {
  content: any;
  diagnostics: IDiagnostic[];
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
};

export type LgTemplateJsonPath = {
  name: string;
  path: string;
};

export type Intent = {
  name: string;
};

export type Utterance = {
  intent: string;
  text: string;
};

export type LuIntentSection = {
  Name: string;
  Body: string;
  Entities?: LuEntity[];
  Children?: LuIntentSection[];
  range?: IRange;
};

export type LuParsed = {
  empty: boolean;
  intents: LuIntentSection[];
  diagnostics: IDiagnostic[];
};

export enum LuSectionTypes {
  SIMPLEINTENTSECTION = 'simpleIntentSection',
  NESTEDINTENTSECTION = 'nestedIntentSection',
  MODELINFOSECTION = 'modelInfoSection',
}

export type LuEntity = {
  Name: string;
};

export type LuFile = {
  id: string;
  content: string;
  diagnostics: IDiagnostic[];
  intents: LuIntentSection[];
  empty: boolean;
  [key: string]: any;
};

export type QnASection = {
  Questions: { content: string; id: string }[];
  Answer: string;
  Body: string;
};

export type QnAFile = {
  id: string;
  content: string;
  qnaSections: QnASection[];
  [key: string]: any;
};

export type LgTemplate = {
  name: string;
  body: string;
  parameters: string[];
  range?: IRange;
};

export type LgParsed = {
  diagnostics: IDiagnostic[];
  templates: LgTemplate[];
};

export type LgFile = {
  id: string;
  content: string;
  diagnostics: IDiagnostic[];
  templates: LgTemplate[];
  allTemplates: LgTemplate[];
  options?: string[];
  parseResult?: any;
};

export type Skill = {
  id: string;
  content: any;
  description?: string;
  endpoints: any[];
  endpointUrl: string;
  manifestUrl: string;
  msAppId: string;
  name: string;
};

export type TextFile = {
  id: string;
  content: string;
};
export type FileResolver = (id: string) => FileInfo | undefined;

export type MemoryResolver = (id: string) => string[] | undefined;

export type SkillManifestInfo = {
  content: { [key: string]: any };
  lastModified: string;
  id: string;
};

export type SkillManifest = {
  content: any;
  id: string;
  path?: string;
  lastModified?: string;
};

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

export type BotInfo = {
  assets: BotAssets;
  diagnostics: IDiagnostic[];
  name: string;
};

export interface BotProjectSpaceSkill {
  workspace?: string;
  manifest?: string;
  remote: boolean;
  endpointName?: string;
}

export interface BotProjectSpace {
  workspace: string;
  name: string;
  skills: {
    [skillId: string]: BotProjectSpaceSkill;
  };
}

export interface BotProjectFile {
  id: string;
  content: BotProjectSpace;
  lastModified: string;
}
