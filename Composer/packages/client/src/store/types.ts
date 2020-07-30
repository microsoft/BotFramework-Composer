// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: remove this once we can expand the types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  PromptTab,
  BotSchemas,
  ProjectTemplate,
  DialogInfo,
  LgFile,
  LuFile,
  Skill,
  UserSettings,
  Diagnostic,
} from '@bfc/shared';
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
  instructions?: string;
  schema?: JSONSchema7;
  features: {
    history: boolean;
    publish: boolean;
    rollback: boolean;
    status: boolean;
    provision: boolean;
  };
}

export interface PublishTarget {
  name: string;
  type: string;
  provisionConfig: string;
  configuration: string;
  lastPublished?: Date;
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

export interface BotState {
  // Unique identifier of a bot
  projectId: string;
  // User-given name
  botName: string;

  // are these two ever read?
  location: string;
  botEnvironment: string;

  // locale of the LG/LU files being worked on in the current bot
  locale: string;

  // components of the current bot
  dialogs: DialogInfo[];
  diagnostics: Diagnostic[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
  skills: Skill[];

  remoteEndpoints: { [key: string]: string }; // possibly unused?

  botStatus: BotStatus;
  botLoadErrorMsg: {
    title: string;
    message: string;
    linkAfterMessage?: { url: string; text: string };
    link?: { url: string; text: string };
  };

  schemas: BotSchemas;
  skillManifests: any[];
  designPageLocation: DesignPageLocation;
  breadcrumb: BreadcrumbItem[];
  showCreateDialogModal: boolean;
  showAddSkillDialogModal: boolean;

  isEnvSettingUpdated: boolean; // seems to be unused
  settings: DialogSetting; // used for LUIS publishing

  actionsSeed: any;

  publishVersions: any;
  publishTypes: PublishType[];
  publishHistory: {
    [key: string]: any[];
  };

  boilerplateVersion: {
    latestVersion?: string;
    currentVersion?: string;
    updateRequired?: boolean;
  };

  // If a bot is opening, we should show a Loading spinner
  botOpening: boolean;

  subscriptions: Subscription[];
  resourceGroups: ResourceGroups[];
  resources: Resource[];
  deployLocations: DeployLocation[];
}

export type AppState = {
  /** the data path for PropertyEditor */
  focusPath: string;
  templateProjects: ProjectTemplate[];
  recentProjects: any[];
  storages: any[];
  focusedStorageFolder: StorageFolder;

  announcement: string | undefined;
  appUpdate: AppUpdateState;

  // URL of running bots, used to link with Emulator. Key is the project ID of a bot, value is the URL
  botEndpoints: { [key: string]: string };

  visualEditorSelection: string[];
  onboarding: {
    coachMarkRefs: { [key: string]: any };
    complete: boolean;
  };
  clipboardActions: any[];

  creationFlowStatus: CreationFlowStatus; // TODO: can be removed with minor refactoring
  storageFileLoadingStatus: string;

  templateId: string; // TODO: can be removed with minor refactoring

  onCreateDialogComplete?: (dialogId: string | null) => void; // callback triggered when the current dialog finishes
  onAddSkillDialogComplete?: (dialogId: string | null) => void;

  runtimeTemplates: RuntimeTemplate[];

  userSettings: UserSettings; // preferences for the editors

  displaySkillManifest?: string;

  // currently displayed error
  error: StateError | null;

  currentUser: {
    token: string | null;
    email?: string;
    name?: string;
    expiration?: number;
    sessionExpired: boolean;
  };
};

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

export type State = BotState & AppState;

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
  endpoint: string;
  authoringEndpoint: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}
export interface DialogSetting {
  MicrosoftAppId?: string;
  MicrosoftAppPassword?: string;
  luis: ILuisConfig;
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
