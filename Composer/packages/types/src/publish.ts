// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { JSONSchema7 } from 'json-schema';

import type { IBotProject } from './server';
import type { UserIdentity } from './user';
import type { ILuisConfig, IQnAConfig } from './settings';
import { AuthParameters } from './auth';

export type PublishResult = {
  message: string;
  /** for azure or pva publish */
  comment?: string;
  eTag?: string;
  log?: string;
  id?: string;
  time?: string;
  status?: number;
  /** for local publish */
  endpointURL?: string;
  /** for PVA publish */
  action?: {
    href: string;
    label: string;
  } | null;
};

export type ProcessStatus = {
  /** Unique Process Id */
  id: string;
  projectId: string;
  /** name used to pull this process if jobId is not known*/
  processName: string;
  /** start time */
  time: Date;
  status: number;
  /** contains latest message */
  message: string;
  /** contains all messages */
  log: string[];
  comment?: string;
  /** contains provision result */
  config?: any;
};

export type PublishResponse = {
  status: number;
  result: PublishResult;
};

export type PullResponse = {
  error?: any;
  eTag?: string;
  status: number;
  /** Path to the pulled .zip containing updated bot content */
  zipPath?: string;
};

type GetAccessToken = (params: AuthParameters) => Promise<string>;

// TODO: Add types for project, metadata
export type PublishPlugin<Config = any> = {
  name: string;
  description: string;

  // methods plugins should support
  publish: (
    config: Config,
    project: IBotProject,
    metadata: any,
    user?: UserIdentity,
    getAccessToken?: GetAccessToken
  ) => Promise<PublishResponse>;
  getStatus?: (
    config: Config,
    project: IBotProject,
    user?: UserIdentity,
    getAccessToken?: GetAccessToken
  ) => Promise<PublishResponse>;
  getHistory?: (
    config: Config,
    project: IBotProject,
    user?: UserIdentity,
    getAccessToken?: GetAccessToken
  ) => Promise<PublishResult[]>;
  rollback?: (
    config: Config,
    project: IBotProject,
    rollbackToVersion: string,
    user?: UserIdentity
  ) => Promise<PublishResponse>;
  pull?: (
    config: Config,
    project: IBotProject,
    user?: UserIdentity,
    getAccessToken?: GetAccessToken
  ) => Promise<PullResponse>;
  provision?: (
    config: Config,
    project: IBotProject,
    user?: UserIdentity,
    getAccessToken?: GetAccessToken
  ) => Promise<ProcessStatus>;
  getProvisionStatus?: (
    target: string,
    project: IBotProject,
    user?: UserIdentity,
    jobId?: string
  ) => Promise<ProcessStatus>;
  getResources?: (
    project: IBotProject,
    user?: UserIdentity
  ) => Promise<
    {
      description: string;
      text: string;
      tier: string;
      group: string;
      key: string;
      required: boolean;
    }[]
  >;
  // other properties
  schema?: JSONSchema7;
  instructions?: string;
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

// structure from json parse PublishTarget.configuration
export type PublishProfile = {
  name?: string;
  environment?: string;
  hostname?: string;
  runtimeIdentifier: string;
  settings: {
    applicationInsights?: {
      InstrumentationKey: string;
    };
    cosmosDb?: {
      cosmosDBEndpoint: string;
      authKey: string;
      databaseId: string;
      containerId: string;
    };
    blobStorage?: {
      connectionString: string;
      container: string;
    };
    luis?: {
      authoringKey: string;
      authoringEndpoint: string;
      endpointKey: string;
      endpoint: string;
      region: string;
    };
    MicrosoftAppId: string;
    MicrosoftAppPassword: string;
  };
  [key: string]: any;
};

export type Subscription = {
  subscriptionId: string;
  tenantId: string;
  displayName: string;
};

export type ResourceGroups = {
  name: string;
  type: string;
  location: string;
  id: string;
  properties: any;
};

export type Resource = {
  name: string;
  id: string;
  type: string;
  location: string;
  kind?: string;
  [key: string]: any;
};

export type DeployLocation = {
  id: string;
  name: string;
  displayName: string;
};
