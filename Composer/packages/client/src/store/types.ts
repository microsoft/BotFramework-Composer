// TODO: Extract some common types to be shared across packages (e.g. DialogInfo, LgFile, etc)
// TODO: remove this once we can expand the types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { CreationFlowStatus, BotStatus } from '../constants';

export interface ActionType {
  type: string;
  payload?: any;
  error?: any;
}

export interface Store {
  dispatch: React.Dispatch<ActionType>;
  state: State;
}

export type ActionCreator = (store: Store, ...args: any[]) => Promise<void> | void;
export type ActionHandlers = { [action: string]: ActionCreator };
export type BoundAction = (...args: any[]) => void;
export type BoundActionHandlers = { [action: string]: BoundAction };

interface StateError {
  summary: string;
  message: string;
}

export interface BreadcrumbItem {
  dialogId: string;
  focusedEvent?: string;
  focusedSteps: string;
}

export interface BotSchemas {
  editor?: any;
}

export interface State {
  dialogs: DialogInfo[];
  botName: string;
  /** the data path for FormEditor */
  focusPath: string;
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
  designPageLocation: any;
  error: StateError | null;
  oAuth: any;
  breadcrumb: BreadcrumbItem[];
  showCreateDialogModal: boolean;
  onCreateDialogComplete?: (dialogId: string | null) => void;
  toStartBot: boolean;
}

export type ReducerFunc = (state: State, payload: any) => State;

export interface DialogInfo {
  id: string;
  displayName: string;
  isRoot: boolean;
  content: any;
  diagnostics: string[];
  luFile: string;
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
