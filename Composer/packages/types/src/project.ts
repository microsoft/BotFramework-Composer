// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from './user';
import { FileInfo } from './indexers';
import { DialogSetting } from './settings';
import { ISettingManager, LocationRef, IBuildConfig } from './server';

export type BotProjectService = {
  getProjectById: (projectId: string, user?: UserIdentity) => Promise<IBotProject>;
};

export type IBotProject = {
  ref: LocationRef;
  id: string | undefined;
  name: string;
  dir: string;
  dataDir: string;
  eTag?: string;
  defaultSDKSchema: {
    [key: string]: string;
  };
  defaultUISchema: {
    [key: string]: string;
  };
  fileStorage: any;
  settingManager: ISettingManager;
  settings: DialogSetting | null;
  dialogFiles: FileInfo[];
  rootDialogId: string;
  formDialogSchemaFiles: FileInfo[];
  botProjectFiles: FileInfo[];
  dialogSchemaFiles: FileInfo[];
  lgFiles: FileInfo[];
  luFiles: FileInfo[];
  schema: FileInfo | undefined;
  uiSchema: FileInfo | undefined;
  uiSchemaOverrides: FileInfo | undefined;
  schemaOverrides: FileInfo | undefined;
  getFile(id: string): FileInfo | undefined;
  init: () => Promise<void>;
  getProject: () => {
    botName: string;
    files: FileInfo[];
    location: string;
    schemas: {
      sdk: {
        content: {
          [key: string]: string;
        };
      };
      ui: {
        content: {
          [key: string]: string;
        };
      };
      uiOverrides: {
        content: {};
      };
      default: {
        [key: string]: string;
      };
      diagnostics: string[];
    };
    diagnostics: any[];
    settings: DialogSetting | null;
    filesWithoutRecognizers: FileInfo[];
  };
  getDefaultSlotEnvSettings: (obfuscate: boolean) => Promise<any>;
  getEnvSettings: (obfuscate: boolean) => Promise<any>;
  updateDefaultSlotEnvSettings: (config: DialogSetting) => Promise<void>;
  updateEnvSettings: (config: DialogSetting) => Promise<void>;
  exportToZip: (exclusions: any, cb: any) => void;
  getSchemas: () => {
    sdk: {
      content: {
        [key: string]: string;
      };
    };
    ui: {
      content: {
        [key: string]: string;
      };
    };
    uiOverrides: {
      content: {};
    };
    default: {
      [key: string]: string;
    };
    diagnostics: string[];
  };
  saveSchemaToProject(schemaUrl: any, pathToSave: any): Promise<void>;
  updateBotInfo: (name: string, description: string, preserveRoot?: boolean) => Promise<void>;
  updateFile: (name: string, content: string) => Promise<string>;
  deleteFile: (name: string) => Promise<void>;
  deleteFiles: (files: any) => Promise<void>;
  validateFileName: (name: string) => void;
  createFile: (
    name: string,
    content?: string
  ) => Promise<{
    name: string;
    content: string;
    path: string;
    relativePath: string;
    lastModified: string;
  }>;
  createFiles: (files: any) => Promise<any>;
  buildFiles: ({ luisConfig, qnaConfig, luResource, qnaResource }: IBuildConfig) => Promise<void>;
  cloneFiles: (locationRef: LocationRef) => Promise<LocationRef>;
  copyTo: (locationRef: LocationRef, user?: UserIdentity | undefined) => Promise<IBotProject>;
  exists(): Promise<boolean>;
  deleteAllFiles(): Promise<boolean>;
  updateQnaEndpointKey: (subscriptionKey: string) => Promise<any>;
  generateDialog(name: string, templateDirs?: string[]): Promise<void>;
  deleteFormDialog(dialogId: string): Promise<void>;
  updateETag(eTag: string): void;
};
