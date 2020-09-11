// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RequestHandler } from 'express-serve-static-core';
import { JSONSchema7 } from 'json-schema';
import { DialogSetting } from '@bfc/shared';
import { IBotProject } from '@bfc/shared';

// TODO: this will be possible when ifilestorage is in a shared module

export interface PublishResult {
  message: string;
  comment?: string;
  log?: string;
  id?: string;
  time?: Date;
  endpointURL?: string;
  status?: number;
}

export interface PublishResponse {
  status: number;
  result: PublishResult;
}

export interface BotTemplate {
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

// TODO: Add types for project, metadata
export interface PublishPlugin<Config = any> {
  // methods plugins should support
  publish: (config: Config, project: IBotProject, metadata: any, user?: UserIdentity) => Promise<PublishResponse>;
  getStatus?: (config: Config, project: IBotProject, user?: UserIdentity) => Promise<PublishResponse>;
  getHistory?: (config: Config, project: IBotProject, user?: UserIdentity) => Promise<PublishResult[]>;
  rollback?: (
    config: Config,
    project: IBotProject,
    rollbackToVersion: string,
    user?: UserIdentity
  ) => Promise<PublishResponse>;

  // other properties
  schema?: JSONSchema7;
  instructions?: string;
  customName?: string;
  customDescription?: string;
  hasView: boolean;
  [key: string]: any;
}

export const DEFAULT_RUNTIME = 'csharp-azurewebapp';

export interface RuntimeTemplate {
  /** method used to eject the runtime into a project. returns resulting path of runtime! */
  eject: (project: IBotProject, localDisk?: any, isReplace?: boolean) => Promise<string>;

  /** build method used for local publish */
  build: (runtimePath: string, project: IBotProject) => Promise<void>;

  run: (project: IBotProject, localDisk?: any) => Promise<void>;

  /** build for deploy method */
  buildDeploy: (
    runtimePath: string,
    project: IBotProject,
    settings: DialogSetting,
    profileName: string
  ) => Promise<string>;

  /** set skill manifest, different folder for different runtime  */
  setSkillManifest: (
    dstRuntimePath: string,
    dstStorage: IFileStorage,
    srcManifestDir: string,
    srcStorage: IFileStorage,
    mode: string
  ) => Promise<void>;

  /** path to code template */
  path: string;

  /** internal use key */
  key: string;

  /** name of runtime template to display in interface */
  name: string;

  /** command used to start runtime */
  startCommand: string;
}

// todo: is there some existing Passport user typedef?
export interface UserIdentity {
  [key: string]: any;
}

export interface ExtensionCollection {
  storage: {
    [key: string]: any;
  };
  publish: {
    [key: string]: {
      plugin: {
        name: string;
        description: string;
        /** (Optional instructions displayed in the UI) */
        instructions?: string;
        /** (Optional) Schema for publishing configuration. */
        schema?: JSONSchema7;
        /** Whether or not the plugin has custom UI to host in the publish surface */
        hasView: boolean;
      };
      methods: PublishPlugin;
    };
  };
  authentication: {
    middleware?: RequestHandler;
    serializeUser?: (user: any, next: any) => void;
    deserializeUser?: (user: any, next: any) => void;
    allowedUrls: string[];
    [key: string]: any;
  };
  runtimeTemplates: RuntimeTemplate[];
  botTemplates: BotTemplate[];
  baseTemplates: BotTemplate[];
}

export interface FileInfo {
  name: string;
  content: string;
  path: string;
  relativePath: string;
  lastModified: string;
}

interface IFileStorage {
  stat(path: string): Promise<Stat>;
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  writeFile(path: string, content: any): Promise<void>;
  removeFile(path: string): Promise<void>;
  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
  rmDir(path: string): Promise<void>;
  rmrfDir(path: string): Promise<void>;
  glob(pattern: string | string[], path: string): Promise<string[]>;
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  zip(source: string, cb: any): unknown;
}

interface Stat {
  isDir: boolean;
  isFile: boolean;
  isWritable: boolean;
  lastModified: string;
  size: string;
}

interface MakeDirectoryOptions {
  recursive?: boolean;
}
