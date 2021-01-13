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
    packageSource: FeedName;
    packageVersion?: string;
  };
  index?: number;
};

export const csharpFeedKey = 'firstPartyCsharp';
export const nodeFeedKey = 'firstPartyNode';
export const defaultFeeds = [nodeFeedKey, csharpFeedKey] as const; // TS3.4 syntax
export type FeedName = typeof defaultFeeds[number]; // 'a'|'b'|'c';
