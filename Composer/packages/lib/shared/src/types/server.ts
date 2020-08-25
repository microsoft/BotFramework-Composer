// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Skill, FileInfo } from './indexers';
import { Diagnostic } from './diagnostic';
import { DialogSetting } from './settings';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  /* absolute path */
  path: string;
  /* tags for further grouping and search secenario */
  tags?: string[];
  /* list of supported runtime versions */
  support?: string[];
}

export interface IBotProject {
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
  skills: Skill[];
  diagnostics: Diagnostic[];
  settingManager: ISettingManager;
  settings: DialogSetting | null;
  getProject: () => {
    botName: string;
    files: FileInfo[];
    location: string;
    schemas: any;
    skills: Skill[];
    diagnostics: Diagnostic[];
    settings: DialogSetting | null;
  };
  [key: string]: any;
}

export interface ISettingManager {
  get(obfuscate?: boolean): Promise<any | null>;
  set(settings: any): Promise<void>;
  getFileName: () => string;
}
