// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface BotSettings {
  feature: BotFeatureSettings;
  blobStorage: BlobStorageConfiguration;
  speech: SpeechConfiguration;
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  cosmosDb: CosmosDbConfiguration;
  applicationInsights: ApplicationInsightsConfiguration;
  luis: LuisConfiguration;
  telemetry: TelemetryConfiguration;
  [key: string]: any;
}

export interface BotFeatureSettings {
  UseShowTypingMiddleware: boolean;
  UseInspectionMiddleware: boolean;
  RemoveRecipientMention: boolean;
  UseSetSpeakMiddleware: boolean;
}

export interface BotSkillSettings {
  isSkill: boolean;
  alllowedCallers: string[];
}

export interface BlobStorageConfiguration {
  connectionString: string;
  container: string;
}

export interface SpeechConfiguration {
  voiceFontName: string;
  fallbackToTextForSpeechIfEmpty: boolean;
}

export interface CosmosDbConfiguration {
  authKey: string;
  containerId: string;
  cosmosDBEndpoint: string;
  databaseId: string;
}

export interface ApplicationInsightsConfiguration {
  InstrumentationKey: string;
}

export interface LuisConfiguration {
  name: string;
  authoringKey: string;
  endpointKey: string;
  endpoint: string;
  authoringEndpoint: string;
  authoringRegion: string;
  defaultLanguage: string;
  environment: string;
}

export interface TelemetryConfiguration {
  logPersonalInformation: boolean;
  logActivities: boolean;
}
