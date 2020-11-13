// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Skill, FileInfo } from './indexers';
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
  skills: Skill[];
  diagnostics: IDiagnostic[];
  settingManager: ISettingManager;
  settings: DialogSetting | null;
  getProject: () => {
    botName: string;
    files: FileInfo[];
    location: string;
    schemas: any;
    skills: Skill[];
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
