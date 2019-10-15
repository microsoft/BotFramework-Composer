// TODO: Extract some common types to be shared across packages (e.g. DialogInfo, LgFile, etc)
// TODO: remove this once we can expand the types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PromptTab } from 'shared';

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

export interface BotSchemas {
  editor?: any;
  sdk?: any;
  diagnostics?: any[];
}

export interface State {
  dialogs: DialogInfo[];
  botName: string;
  location: string;
  botEnvironment: string;
  botEndpoint: string;
  /** the data path for FormEditor */
  focusPath: string;
  templateProjects: any[];
  recentProjects: any[];
  storages: any[];
  focusedStorageFolder: any;
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
}

export type ReducerFunc<T = any> = (state: State, payload: T) => State;
export interface MiddlewareApi {
  getState: () => State;
  dispatch: React.Dispatch<ActionType>;
}

export type MiddlewareFunc = (middlewareApi: MiddlewareApi) => (next: any) => React.Dispatch<ActionType>;

export interface ITrigger {
  id: string;
  displayName: string;
  type: string;
  isIntent: boolean;
}

export interface DialogInfo {
  id: string;
  displayName: string;
  isRoot: boolean;
  content: any;
  diagnostics: string[];
  luFile: string;
  triggers: ITrigger[];
}

export interface Intent {
  name: string;
}

export interface Utterance {
  intent: string;
  text: string;
}

export interface LuDiagnostic {
  text: string;
}

export interface LuFile {
  id: string;
  relativePath: string;
  content: string;
  parsedContent: {
    LUISJsonStructure: {
      intents: Intent[];
      utterances: Utterance[];
    };
  };
  diagnostics: LuDiagnostic[];
}

export interface LgFile {
  id: string;
  relativePath: string;
  content: string;
}

export interface LgTemplate {
  Name: string;
  Body: string;
}

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
