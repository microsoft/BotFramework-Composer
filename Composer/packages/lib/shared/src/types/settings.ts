// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface CodeEditorSettings {
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

export interface UserSettings {
  appUpdater: AppUpdaterSettings;
  codeEditor: CodeEditorSettings;
  propertyEditorWidth: number;
  dialogNavWidth: number;
}

export interface AppUpdaterSettings {
  autoDownload: boolean;
  useNightly: boolean;
}

export interface DialogSetting {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis: ILuisConfig;
  qna: IQnAConfig;
  publishTargets?: PublishTarget[];
  runtime: {
    customRuntime: boolean;
    path: string;
    command: string;
  };
  defaultLanguage: string;
  languages: string[];
  skill?: {
    [skillName: string]: {
      name?: string;
      manifestUrl: string;
      msAppId?: string;
      endpoint?: string;
    };
  };
  botId?: string;
  skillHostEndpoint?: string;
  [key: string]: any;
}

export interface ILuisConfig {
  name: string;
  endpoint: string;
  authoringKey: string;
  endpointKey: string;
  authoringEndpoint: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}

export interface IQnAConfig {
  subscriptionKey: string;
  endpointKey: string;
  qnaRegion: string;
  [key: string]: string;
}

export interface IConfig extends ILuisConfig {
  subscriptionKey: string;
  qnaRegion: string | 'westus';
}

export interface IPublishConfig {
  luis: ILuisConfig;
  qna: IQnAConfig;
}

export interface PublishTarget {
  name: string;
  type: string;
  configuration: string;
  lastPublished?: Date;
}
