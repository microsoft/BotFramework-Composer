// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RequestHandler } from 'express-serve-static-core';
import { JSONSchema7 } from 'json-schema';
import { DialogSetting } from '@bfc/client/src/store/types';

// TODO: this will be possible when ifilestorage is in a shared module
// import { IFileStorage } from '../../../server/src/models/storage/interface';

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
  publish: (config: Config, project: BotProject, metadata: any, user?: UserIdentity) => Promise<PublishResponse>;
  getStatus?: (config: Config, project: BotProject, user?: UserIdentity) => Promise<PublishResponse>;
  getHistory?: (config: Config, project: BotProject, user?: UserIdentity) => Promise<PublishResult[]>;
  rollback?: (
    config: Config,
    project: BotProject,
    rollbackToVersion: string,
    user?: UserIdentity
  ) => Promise<PublishResponse>;
  [key: string]: any;
}

export interface RuntimeTemplate {
  /** method used to eject the runtime into a project. returns resulting path of runtime! */
  eject: (project: BotProject, localDisk?: any) => Promise<string>;

  /** build method  */
  build: (runtimePath: string, project: BotProject) => Promise<void>;

  /** run  */
  run: (project: BotProject, localDisk?: any) => Promise<void>;

  /** build for deploy method  */
  buildDeploy: (
    runtimePath: string,
    project: BotProject,
    settings: DialogSetting,
    profileName: string
  ) => Promise<string>;

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
      };
      methods: PublishPlugin;
      /** (Optional instructions displayed in the UI) */
      instructions?: string;
      /** (Optional) Schema for publishing configuration. */
      schema?: JSONSchema7;
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

export interface BotProject {
  locale: string;
  id: string | undefined;
  name: string;
  dir: string;
  dataDir: string;
  files: FileInfo[];
  defaultSDKSchema: {
    [key: string]: string;
  };
  settings: DialogSetting | null;
  [key: string]: any;
}

export interface FileInfo {
  name: string;
  content: string;
  path: string;
  relativePath: string;
  lastModified: string;
}
