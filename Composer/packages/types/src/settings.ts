// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7Type } from 'json-schema';
import { ModelTypes } from './orchestrator';

import type { PublishTarget } from './publish';

export interface LibraryRef {
  name: string;
  version: string;
  lastImported: Date;
  location: string;
}

export type AdapterRecord = {
  name: string;
  route?: JSONSchema7Type;
  type?: JSONSchema7Type;
  enabled: boolean;
};

export type CodeEditorSettings = {
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
  fontSettings: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  fadedWhenReadOnly?: boolean;
};

export type TelemetrySettings = {
  allowDataCollection?: boolean;
};

export type UserSettings = {
  appUpdater: AppUpdaterSettings;
  codeEditor: CodeEditorSettings;
  propertyEditorWidth: number;
  dialogNavWidth: number;
  appLocale: string;
  telemetry: TelemetrySettings;
};

export type AppUpdaterSettings = {
  autoDownload: boolean;
  useNightly: boolean;
};

export type SkillSetting = {
  msAppId: string;
  endpointUrl: string;
};

export type RuntimeSettings = {
  adapters?: AdapterRecord[];
  features?: {
    removeRecipientMentions?: boolean;
    showTyping?: boolean;
    traceTranscript?: boolean;
    useInspection?: boolean;
    blobTranscript?: {
      connectionString?: string;
      containerName?: string;
    };
    setSpeak?: {
      voiceFontName?: string;
      fallbackToTextForSpeechIfEmpty?: true;
    };
  };
  components?: [];
  skills?: {
    allowedCallers?: string[];
  };
  storage?: string;
  telemetry?: {
    options?: {
      connectionString?: string;
      instrumentationKey?: string;
    };
    instrumentationKey?: string;
    logActivities?: boolean;
    logPersonalInformation?: boolean;
  };
};

export type DialogSetting = {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis: ILuisConfig;
  orchestrator?: IOrchestratorConfig;
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
  customFunctions: string[];
  defaultLocale?: string;
  runtimeSettings?: RuntimeSettings;
  [key: string]: any;
};

export type ILuisConfig = {
  name: string;
  endpoint: string;
  authoringKey: string;
  endpointKey: string;
  authoringEndpoint: string;
  authoringRegion?: string | 'westus';
  region?: string;
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
  directVersionPublish?: boolean;
};

export type ILUFeaturesConfig = {
  enablePattern?: boolean;
  enableMLEntities?: boolean;
  enableListEntities?: boolean;
  enableCompositeEntities?: boolean;
  enablePrebuiltEntities?: boolean;
  enableRegexEntities?: boolean;
  enablePhraseLists?: boolean;
  isOrchestartor?: boolean;
};

export type IQnAConfig = {
  subscriptionKey: string | undefined;
  endpointKey: string;
  qnaRegion?: string;
  knowledgebaseid?: string;
  hostname?: string;
};

export type IOrchestratorConfig = {
  model?: Partial<Record<ModelTypes, string>>;
};

export type IConfig = ILuisConfig &
  IOrchestratorConfig & {
    subscriptionKey: string;
    qnaRegion: string | 'westus';
  };

export type LgOptions = {
  customFunctions: string[];
};
