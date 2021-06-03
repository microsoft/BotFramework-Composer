// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * For azure publish
 */
export enum BotProjectDeployLoggerType {
  // Logger Type for Provision
  PROVISION_INFO = 'PROVISION_INFO',
  PROVISION_ERROR = 'PROVISION_ERROR',
  PROVISION_WARNING = 'PROVISION_WARNING',
  PROVISION_SUCCESS = 'PROVISION_SUCCESS',
  PROVISION_ERROR_DETAILS = 'PROVISION_ERROR_DETAILS',

  // Logger Type for Deploy
  DEPLOY_INFO = 'DEPLOY_INFO',
  DEPLOY_ERROR = 'DEPLOY_ERROR',
  DEPLOY_WARNING = 'DEPLOY_WARNING',
  DEPLOY_SUCCESS = 'DEPLOY_SUCCESS',
}

export enum BotProjectRuntimeType {
  CSHARP = 'CSHARP',
  NODE = 'NODE',
}

export interface BotProjectDeployConfig {
  // access token to access azure
  accessToken: string;

  // The project path to deploy
  projPath: string;

  // Logger
  logger: (...args: any[]) => void;

  // Deploy file path, default is .deployment file
  deployFilePath?: string;

  // Zip file path, default is 'code.zip'
  zipPath?: string;

  // Publishing folder for 'dotnet publish' command, default is 'bin/Release/netcoreapp3.1'
  publishFolder?: string;

  // The ARM template file path, default is 'DeploymentTemplates/template-with-preexisting-rg.json'
  templatePath?: string;

  // Dotnet project path, default is 'Microsoft.BotFramework.Composer.WebApp.csproj'
  dotnetProjectPath?: string;

  // Lubuild generated folder path, default is 'generated'
  generatedFolder?: string;

  // Remote bot json dialog path, default is 'ComposerDialogs'
  remoteBotPath?: string;

  // Runtime Type for botproject
  runtimeType?: BotProjectRuntimeType;

  [key: string]: any;
}

/**
 * for background process manager
 */
export interface ProcessStatus {
  id: string; // jobId
  projectId: string; // reference to projectId that this process is for
  processName: string; // name used to pull this process if jobId is not known
  time: Date; // contains start time
  status: number; // contains http status code
  message: string; // contains latest message
  log: string[]; // contains all messages
  comment?: string; // contains user supplied comment about process
  config?: any; // contains provision result
}

export interface ProcessList {
  [key: string]: ProcessStatus;
}
