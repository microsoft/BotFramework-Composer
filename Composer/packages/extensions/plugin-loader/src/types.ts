// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

// TODO: Add types for project, metadata, user
export interface PublishPlugin<Config = any> {
  publish: (config: Config, project: any, metadata: any, user: any) => Promise<PublishResponse>;
  getStatus?: (config: Config, project: any, user: any) => Promise<PublishResponse>;
  getHistory?: (config: Config, project: any, user: any) => Promise<PublishResult[]>;
  rollback?: (config: Config, project: any, rollbackToVersion: string, user: any) => Promise<PublishResponse>;
  [key: string]: any;
}

export interface RuntimeTemplate {
  key: string; // internal use key
  name: string; // name of runtime template to display in interface
  path: string; // path to runtime template on disk
  startCommand: string; // command used to start runtime
}

// todo: is there some existing Passport user typedef?
export interface UserIdentity {
  [key: string]: any;
}
