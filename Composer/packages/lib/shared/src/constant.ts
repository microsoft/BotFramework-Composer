// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const SensitiveProperties = ['MicrosoftAppPassword', 'luis.authoringKey', 'luis.endpointKey'];
export const FieldNames = {
  Events: 'triggers',
  Actions: 'actions',
  ElseActions: 'elseActions',
  Condition: 'condition',
  DefaultCase: 'default',
  Cases: 'cases',
};
export const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  configuration: JSON.stringify({}),
};
export const DEFAULT_RUNTIME = 'dotnet';

export interface DialogSetting {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis?: ILuisConfig;
  publishTargets?: PublishTarget[];
  downsampling?: IDownSamplingConfig;
  runtime?: {
    customRuntime: boolean;
    path: string;
    command: string;
    key: string;
    name: string;
  };
  [key: string]: unknown;
}

export interface IDownSamplingConfig {
  maxImbalanceRatio: number;
  maxUtteranceAllowed: number;
}

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  endpointKey: string;
  endpoint: string;
  authoringEndpoint: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}

export interface PublishTarget {
  name: string;
  type: string;
  configuration: string;
  lastPublished?: Date;
}
