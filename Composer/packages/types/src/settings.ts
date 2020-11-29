// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import type { PublishTarget } from './publish';

export interface LibraryRef {
  name: string;
  version: string;
  lastImported: Date;
  location: string;
}

export type CodeEditorSettings = {
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
};

export type UserSettings = {
  appUpdater: AppUpdaterSettings;
  codeEditor: CodeEditorSettings;
  propertyEditorWidth: number;
  dialogNavWidth: number;
  appLocale: string;
};

export type AppUpdaterSettings = {
  autoDownload: boolean;
  useNightly: boolean;
};

export type SkillSetting = {
  name: string;
  manifestUrl: string;
  msAppId: string;
  endpointUrl: string;
};

export type DialogSetting = {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis: ILuisConfig;
  luFeatures: ILUFeaturesConfig;
  qna: IQnAConfig;
  publishTargets?: PublishTarget[];
  runtime: {
    key: string;
    customRuntime: boolean;
    path: string;
    command: string;
  };
  defaultLanguage: string;
  importedLibraries: LibraryRef[];
  languages: string[];
  skill?: {
    [skillName: string]: SkillSetting;
  };
  botId?: string;
  skillHostEndpoint?: string;
  customizedFunctions: string[];
  [key: string]: any;
};

export type ILuisConfig = {
  name: string;
  endpoint: string;
  authoringKey: string;
  endpointKey: string;
  authoringEndpoint: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
};

export type ILUFeaturesConfig = {
  enablePattern?: boolean;
  enableMLEntities?: boolean;
  enableListEntities?: boolean;
  enableCompositeEntities?: boolean;
  enablePrebuiltEntities?: boolean;
  enableRegexEntities?: boolean;
  enablePhraseLists?: boolean;
};

export type IQnAConfig = {
  subscriptionKey: string;
  endpointKey: string;
  qnaRegion: string;
  [key: string]: string;
};

export type IConfig = ILuisConfig & {
  subscriptionKey: string;
  qnaRegion: string | 'westus';
};
