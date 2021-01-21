// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type BotTemplateV2 = {
  id: string;
  name: string;
  description: string;
  /* keywords for further grouping and search secenario */
  keywords?: string[];
  /* list of supported runtime versions */
  support?: string[];
  package?: {
    packageName: string;
    packageSource: FeedType;
    packageVersion?: string;
  };
  index?: number;
};

export const csharpFeedKey = 'firstPartyCsharp';
export const nodeFeedKey = 'firstPartyNode';
export const defaultFeeds = [nodeFeedKey, csharpFeedKey] as const;
export type FeedName = typeof defaultFeeds[number];
export type FeedType = 'npm' | 'nuget';
