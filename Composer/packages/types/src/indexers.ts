// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDiagnostic, IRange } from './diagnostic';
import { IIntentTrigger } from './dialogUtils';
import { MicrosoftIDialog } from './sdk';
import { SDKKinds } from './schema';

import { DialogSetting } from './index';

export enum FileExtensions {
  Dialog = '.dialog',
  DialogSchema = '.schema',
  FormDialogSchema = '.form',
  Manifest = '.json',
  Lu = '.lu',
  Lg = '.lg',
  Qna = '.qna',
  SourceQnA = '.source.qna',
  Setting = 'appsettings.json',
  BotProject = '.botproj',
  Json = '.json',
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
  content: any;
};

export type ReferredLuIntents = {
  name: string;
  path: string;
};

export type DialogSchemaFile = {
  id: string;
  content: any;
};

export type LuProviderType = SDKKinds.LuisRecognizer | SDKKinds.OrchestratorRecognizer;

export type DialogInfo = {
  content: MicrosoftIDialog;
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
  luProvider?: LuProviderType;
  isFormDialog: boolean;
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
  resource: LuParseResource;
  imports: { id: string; path: string; description: string }[];
  published?: boolean;
};

export type LuParseResourceSection = {
  Name: string;
  Body: string;
  SectionType: string;
  Path: string;
  Id: string;
  Description: string;
  Answer: string;
  Questions: string[];
  ModelInfo: string;
  [key: string]: any;
};

export type LuParseResource = {
  Sections: LuParseResourceSection[];
  Errors: any[];
  Content: string;
};

export type QnASection = {
  sectionId: string;
  Questions: { content: string; id: string }[];
  Answer: string;
  Body: string;
  range?: IRange;
};

export type QnAFile = {
  id: string;
  content: string;
  diagnostics: IDiagnostic[];
  qnaSections: QnASection[];
  imports: { id: string; path: string; description: string }[];
  options: { id: string; name: string; value: string }[];
  empty: boolean;
  resource: LuParseResource;
};

export type LgTemplate = {
  name: string;
  body: string;
  parameters: string[];
  range?: IRange;
  properties?: Record<string, unknown>;
};

export type LgParsed = {
  diagnostics: IDiagnostic[];
  templates: LgTemplate[];
};

export type LanguageFileImport = {
  /**
   * The display name of the import (the part between the brackets)
   */
  displayName: string;

  /**
   * The path to the language files (the part between the parens)
   */
  importPath: string;

  /**
   * The ID of the LGFile or LUFile (extracted from the importPath)
   */
  id: string;
};

export type LgFile = {
  id: string;
  content: string;
  diagnostics: IDiagnostic[];
  templates: LgTemplate[];
  allTemplates: LgTemplate[];
  imports: { id: string; path: string; description: string }[];
  options?: string[];
  parseResult?: any;
};

export type Manifest = {
  name: string;
  version: string;
  description: string;
  endpoints: ManifestEndpoint[];
};

export type ManifestEndpoint = {
  name: string;
  endpointUrl: string;
  msAppId: string;
  description: string;
};

export type Skill = {
  id: string;
  manifest?: Manifest;
  description?: string;
  name: string;
  remote: boolean;
};

export type JsonSchemaFile = {
  id: string;
  content: any;
};

export type TextFile = {
  id: string;
  content: string;
};
export type FileResolver = (id: string) => FileInfo | undefined;

export type MemoryResolver = (id: string) => string[] | undefined;

export type SkillManifestFile = {
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
  skillManifests: SkillManifestFile[];
  setting: DialogSetting;
  dialogSchemas: DialogSchemaFile[];
  formDialogSchemas: FormDialogSchema[];
  botProjectFile: BotProjectFile;
  jsonSchemaFiles: JsonSchemaFile[];
  recognizers: RecognizerFile[];
  crossTrainConfig: CrosstrainConfig;
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

export type FormDialogSchema = {
  id: string;
  content: string;
};

export type FormDialogSchemaTemplate = {
  name: string;
  isGlobal: boolean;
};

export type RecognizerFile = {
  id: string;
  content: {
    $kind: SDKKinds;
  };
};

export type CrosstrainConfig = {
  [fileName: string]: { rootDialog: boolean; triggers: { [intentName: string]: string[] } };
};
