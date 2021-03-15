// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const csharpFeedKey = 'firstPartyCsharp';
export const nodeFeedKey = 'firstPartyNode';
export const defaultFeeds = [nodeFeedKey, csharpFeedKey] as const;
export type FeedName = typeof defaultFeeds[number];
export type FeedType = 'npm' | 'nuget';

export const webAppRuntimeKey = 'azureWebApp';
export const functionsRuntimeKey = 'azureFunctions';
export const availableRunTimes = [webAppRuntimeKey, functionsRuntimeKey] as const;
export type RuntimeType = typeof availableRunTimes[number];
