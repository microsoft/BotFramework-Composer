// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@bfc/extension';
import { AppUpdaterSettings, CodeEditorSettings, DialogInfo, LuFile, LgFile, PromptTab } from '@bfc/shared';

import { AppUpdaterStatus } from '../constants';

import { SkillManifest } from './../pages/design/exportSkillModal/constants';

export interface StateError {
  status?: number;
  summary: string;
  message: any;
}

export interface File {
  name: string;
  type: string;
  path: string;
  size?: number;
  lastModified?: string;
}

export interface StorageFolder extends File {
  parent: string;
  children?: File[];
  writable?: boolean;
}

export interface PublishType {
  name: string;
  description: string;
  instructions?: string;
  schema?: JSONSchema7;
  features: {
    history: boolean;
    publish: boolean;
    rollback: boolean;
    status: boolean;
  };
}

export interface RuntimeTemplate {
  /** internal use key */
  key: string;
  /** name of runtime template to display in interface */
  name: string;
  /** path to runtime template */
  path: string;
  /** command used to start runtime */
  startCommand: string;
}

export interface BotLoadError {
  title: string;
  message: string;
  linkAfterMessage?: { url: string; text: string };
  link?: { url: string; text: string };
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

export interface DesignPageLocation {
  projectId: string;
  dialogId: string;
  selected: string;
  focused: string;
  promptTab?: PromptTab;
}

export interface AppUpdateState {
  downloadSizeInBytes?: number;
  error?: any;
  progressPercent?: number;
  showing: boolean;
  status: AppUpdaterStatus;
  version?: string;
}

export interface PublishTarget {
  name: string;
  type: string;
  configuration: string;
  lastPublished?: Date;
}

export interface BreadcrumbItem {
  dialogId: string;
  selected: string;
  focused: string;
}

export interface DialogSetting {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis: ILuisConfig;
  publishTargets?: PublishTarget[];
  runtime: {
    customRuntime: boolean;
    path: string;
    command: string;
  };
  [key: string]: unknown;
}

export type dialogPayload = {
  id: string;
  content: any;
  projectId: string;
};

export type DesignPageLocationPayload = {
  projectId: string;
  dialogId: string;
  selected: string;
  focused: string;
  breadcrumb: BreadcrumbItem[];
  promptTab?: string;
};

export type UserSettingsPayload = {
  appUpdater: Partial<AppUpdaterSettings>;
  codeEditor: Partial<CodeEditorSettings>;
  propertyEditorWidth: number;
  dialogNavWidth: number;
};

export type BotAssets = {
  projectId: string;
  dialogs: DialogInfo[];
  luFiles: LuFile[];
  lgFiles: LgFile[];
  skillManifests: SkillManifest[];
  setting: DialogSetting;
};

export type BoilerplateVersion = {
  latestVersion?: string;
  currentVersion?: string;
  updateRequired?: boolean;
};
