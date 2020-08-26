// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotProjectRuntimeType } from './botProjectRuntimeType';

export interface BotProjectDeployConfig {
  // Subscription Id of Azure Account
  subId: string;

  // credential
  creds?: any;

  // access token to access azure
  accessToken: string;

  // The project path to deploy
  projPath: string;

  // Logger
  logger: (string) => any;

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
