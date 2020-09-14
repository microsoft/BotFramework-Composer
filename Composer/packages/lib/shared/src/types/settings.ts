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
  appLocale: string;
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
      name: string;
      manifestUrl: string;
      msAppId: string;
      endpointUrl: string;
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
  provisionConfig: string;
  provisionStatus: string;
  lastPublished?: Date;
}

export interface Subscription {
  subscriptionId: string;
  tenantId: string;
  displayName: string;
}

export interface ResourceGroups {
  name: string;
  type: string;
  location: string;
  id: string;
  properties: any;
}

export interface Resource {
  name: string;
  id: string;
  type: string;
  location: string;
  kind?: string;
  [key: string]: any;
}

export interface DeployLocation {
  id: string;
  name: string;
  displayName: string;
}
