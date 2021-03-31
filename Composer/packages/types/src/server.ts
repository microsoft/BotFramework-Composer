// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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

export type DirectLineLogType = 'Error' | 'Warn' | 'Info';

export interface DirectLineError {
  status: number;
  message: string;
  details?: string;
}

export interface DirectLineLog extends DirectLineError {
  timestamp: string;
  route?: string;
  logType: DirectLineLogType;
}

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
  timestamp: string;
  trafficType: 'network';
};

export type ConversationActivityTraffic = {
  activities: any[];
  trafficType: 'activity';
};

export type ConversationActivityTrafficItem = {
  activity: any;
  timestamp: string;
  trafficType: 'activity';
};

export type ConversationNetworkErrorItem = {
  error: {
    message: string;
    details?: string;
  };
  request: NetworkTrafficRequest;
  response: NetworkTrafficResponse;
  timestamp: string;
  trafficType: 'networkError';
};
