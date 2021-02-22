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
