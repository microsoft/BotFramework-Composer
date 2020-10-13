// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { JSONSchema7 } from 'json-schema';

import type { IBotProject } from './server';
import type { UserIdentity } from './user';
import type { ILuisConfig, IQnAConfig } from './settings';

export type PublishResult = {
  message: string;
  comment?: string;
  log?: string;
  id?: string;
  time?: Date;
  endpointURL?: string;
  status?: number;
};

export type PublishResponse = {
  status: number;
  result: PublishResult;
};

// TODO: Add types for project, metadata
export type PublishPlugin<Config = any> = {
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
  bundleId?: string;
  [key: string]: any;
};

export type IPublishConfig = {
  luis: ILuisConfig;
  qna: IQnAConfig;
};

export type PublishTarget = {
  name: string;
  type: string;
  configuration: string;
  lastPublished?: Date;
};
