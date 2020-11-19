// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@bfc/extension-client';
import { AppUpdaterSettings, CodeEditorSettings, PromptTab } from '@bfc/shared';

import { AppUpdaterStatus } from '../constants';

import { CardProps } from './../components/Notifications/NotificationCard';

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
  extensionId: string;
  bundleId?: string;
  instructions?: string;
  schema?: JSONSchema7;
  features: {
    history: boolean;
    publish: boolean;
    pull: boolean;
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

export interface DesignPageLocation {
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
  breadcrumb: string[];
  promptTab?: string;
};

export type UserSettingsPayload = {
  appUpdater: Partial<AppUpdaterSettings>;
  codeEditor: Partial<CodeEditorSettings>;
  propertyEditorWidth: number;
  dialogNavWidth: number;
  appLocale: string;
};

export type BoilerplateVersion = {
  latestVersion?: string;
  currentVersion?: string;
  updateRequired?: boolean;
};

export type Notification = CardProps & { id: string };
