// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const csharpFeedKey = 'dotnet';
export const nodeFeedKey = 'js';
export const defaultFeeds = [nodeFeedKey, csharpFeedKey] as const;
export type FeedName = typeof defaultFeeds[number];
export type FeedType = 'npm' | 'nuget';

type WebApplicationInfo = {
  id: string;
  resource: string;
};

type Command = {
  title: string;
  description: string;
};

type Name = {
  short: string;
  full: string;
};

type Icons = {
  color: string;
  outline: string;
};

type Developer = {
  name: string;
  websiteUrl: string;
  privacyUrl: string;
  termsOfUseUrl: string;
};

type CommandList = {
  scopes: string[];
  commands: Command[];
};

type Bot = {
  botId: string;
  scopes: string[];
  commandList?: CommandList[];
  supportsFiles?: boolean;
  isNotificationOnly?: boolean;
};

export type TeamsManifest = {
  $schema: string;
  manifestVersion: string;
  version: string;
  id: string;
  packageName: string;
  developer: Developer;
  icons: Icons;
  name: Name;
  description: Name;
  accentColor: string;
  bots: Bot[];
  permissions: string[];
  validDomains: string[];
  webApplicationInfo?: WebApplicationInfo;
  devicePermissions?: string[];
};

export const webAppRuntimeKey = 'webapp';
export const functionsRuntimeKey = 'functions';
export const availableRunTimes = [webAppRuntimeKey, functionsRuntimeKey] as const;
export type RuntimeType = typeof availableRunTimes[number];
