// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';

import { FileInfo } from './indexers';
import { IDiagnostic } from './diagnostic';
import { DialogSetting } from './settings';

export type IBotProject = {
  fileStorage: any;
  dir: string;
  dataDir: string;
  eTag?: string;
  id: string | undefined;
  name: string;
  builder: any;
  defaultSDKSchema: {
    [key: string]: string;
  };
  defaultUISchema: {
    [key: string]: string;
  };
  diagnostics: IDiagnostic[];
  settingManager: ISettingManager;
  settings: DialogSetting | null;
  getProject: () => {
    botName: string;
    files: FileInfo[];
    location: string;
    schemas: any;
    diagnostics: IDiagnostic[];
    settings: DialogSetting | null;
  };
  [key: string]: any;
};

export type ISettingManager = {
  get(obfuscate?: boolean): Promise<any | null>;
  set(settings: any): Promise<void>;
  getFileName: () => string;
};

export interface DirectLineError {
  status: number;
  message: string;
  details?: string;
}

/** Types of Web Chat traffic that can be sent to the client */
export type ConversationTrafficItem =
  | ConversationActivityTrafficItem
  | ConversationNetworkTrafficItem
  | ConversationNetworkErrorItem;

export type NetworkTrafficRequest = {
  method: string;
  payload: any;
  route: string;
};

export type NetworkTrafficResponse = {
  payload: any;
  statusCode: number;
};

export type ConversationNetworkTrafficItem = {
  request: NetworkTrafficRequest;
  response: NetworkTrafficResponse;
  timestamp: number;
  trafficType: 'network';
};

export type ConversationActivityTraffic = {
  activities: Activity[];
  trafficType: 'activity';
};

export type ConversationActivityTrafficItem = {
  activity: Activity;
  timestamp: number;
  trafficType: 'activity';
};

export type ConversationNetworkErrorItem = {
  error: {
    message: string;
    details?: string;
  };
  request: NetworkTrafficRequest;
  response: NetworkTrafficResponse;
  timestamp: number;
  trafficType: 'networkError';
};
