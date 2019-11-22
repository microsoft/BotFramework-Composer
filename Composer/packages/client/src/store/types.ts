// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: remove this once we can expand the types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PromptTab, DialogInfo, BotSchemas, LgFile, LuFile, ProjectTemplate } from '@bfc/shared';

import { CreationFlowStatus, BotStatus } from '../constants';

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
}

export interface State {
  dialogs: DialogInfo[];
  botName: string;
  location: string;
  botEnvironment: string;
  botEndpoint: string;
  remoteEndpoints: { [key: string]: string };
  /** the data path for FormEditor */
  focusPath: string;
  templateProjects: ProjectTemplate[];
  recentProjects: any[];
  storages: any[];
  focusedStorageFolder: StorageFolder;
  botStatus: BotStatus;
  botLoadErrorMsg: string;
  creationFlowStatus: CreationFlowStatus;
  templateId: string;
  storageFileLoadingStatus: string;
  schemas: BotSchemas;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  designPageLocation: DesignPageLocation;
  error: StateError | null;
  breadcrumb: BreadcrumbItem[];
  showCreateDialogModal: boolean;
  isEnvSettingUpdated: boolean;
  settings: DialogSetting;
  onCreateDialogComplete?: (dialogId: string | null) => void;
  toStartBot: boolean;
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
  [key: string]: any;
}

export interface DesignPageLocation {
  dialogId: string;
  selected: string;
  focused: string;
  promptTab?: PromptTab;
}
