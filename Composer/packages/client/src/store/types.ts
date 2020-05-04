// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: remove this once we can expand the types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PromptTab, BotSchemas, ProjectTemplate, DialogInfo, LgFile, LuFile, Skill, UserSettings } from '@bfc/shared';
import { JSONSchema7 } from '@bfc/extension';

import { AppUpdaterStatus, CreationFlowStatus, BotStatus } from '../constants';

import { ActionType } from './action/types';

export interface Store {
  dispatch: React.Dispatch<ActionType>;
  getState: () => State;
}

export type ActionCreator<T extends any[] = any[]> = (store: Store, ...args: T) => Promise<void> | void;
export type ActionHandlers = { [action: string]: ActionCreator };
export type BoundAction = (...args: any[]) => void | Promise<void>;
export type BoundActionHandlers = { [action: string]: BoundAction };

interface StateError {
  status?: number;
  summary: string;
  message: string;
}

export interface BreadcrumbItem {
  dialogId: string;
  selected: string;
  focused: string;
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
  schema?: JSONSchema7;
  features: {
    history: boolean;
    publish: boolean;
    rollback: boolean;
    status: boolean;
  };
}

export interface PublishTarget {
  name: string;
  type: string;
  configuration: string;
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

export interface State {
  dialogs: DialogInfo[];
  projectId: string;
  botName: string;
  location: string;
  botEnvironment: string;
  locale: string;
  botEndpoints: { [key: string]: string };
  remoteEndpoints: { [key: string]: string };
  /** the data path for PropertyEditor */
  focusPath: string;
  templateProjects: ProjectTemplate[];
  recentProjects: any[];
  storages: any[];
  focusedStorageFolder: StorageFolder;
  botStatus: BotStatus;
  botLoadErrorMsg: { title: string; message: string };
  creationFlowStatus: CreationFlowStatus;
  templateId: string;
  storageFileLoadingStatus: string;
  schemas: BotSchemas;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  skills: Skill[];
  skillManifests: any[];
  designPageLocation: DesignPageLocation;
  error: StateError | null;
  breadcrumb: BreadcrumbItem[];
  showCreateDialogModal: boolean;
  showAddSkillDialogModal: boolean;
  isEnvSettingUpdated: boolean;
  settings: DialogSetting;
  actionsSeed: any;
  onCreateDialogComplete?: (dialogId: string | null) => void;
  onAddSkillDialogComplete?: (dialogId: string | null) => void;
  currentUser: {
    token: string | null;
    email?: string;
    name?: string;
    expiration?: number;
    sessionExpired: boolean;
  };
  publishVersions: any;
  publishStatus: any;
  lastPublishChange: any;
  visualEditorSelection: string[];
  onboarding: {
    coachMarkRefs: { [key: string]: any };
    complete: boolean;
  };
  clipboardActions: any[];
  publishTargets: any[];
  runtimeTemplates: RuntimeTemplate[];
  publishTypes: PublishType[];
  publishHistory: {
    [key: string]: any[];
  };
  userSettings: UserSettings;
  runtimeSettings: {
    path: string;
    startCommand: string;
  };
  announcement: string | undefined;
  appUpdate: AppUpdateState;
}

export type ReducerFunc<T = any> = (state: State, payload: T) => State;
export interface MiddlewareApi {
  getState: () => State;
  dispatch: React.Dispatch<ActionType>;
}

export type MiddlewareFunc = (middlewareApi: MiddlewareApi) => (next: any) => React.Dispatch<ActionType>;

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  endpointKey: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}
export interface DialogSetting {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis?: ILuisConfig;
  publishTargets?: PublishTarget[];
  runtime?: {
    customRuntime: boolean;
    path: string;
    command: string;
  };
  [key: string]: unknown;
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
