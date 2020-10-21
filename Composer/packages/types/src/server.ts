// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from './indexers';
import { IDiagnostic } from './diagnostic';
import { DialogSetting } from './settings';

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  /* absolute path */
  path: string;
  /* tags for further grouping and search secenario */
  tags?: string[];
  /* list of supported runtime versions */
  support?: string[];
};

export type IBotProject = {
  fileStorage: any;
  dir: string;
  dataDir: string;
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
