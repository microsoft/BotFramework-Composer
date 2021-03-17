// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const csharpFeedKey = 'dotnet';
export const nodeFeedKey = 'js';
export const defaultFeeds = [nodeFeedKey, csharpFeedKey] as const;
export type FeedName = typeof defaultFeeds[number];
export type FeedType = 'npm' | 'nuget';

export const webAppRuntimeKey = 'webapp';
export const functionsRuntimeKey = 'functions';
export const availableRunTimes = [webAppRuntimeKey, functionsRuntimeKey] as const;
export type RuntimeType = typeof availableRunTimes[number];
