// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fetch from '../../utility/fetch';

// TODO: update feed url
const feedUrl = 'https://aka.ms/bf-composer-home-feed-v1';

export const getFeedUrl = async (): Promise<any> => {
  const response = await fetch(feedUrl);
  return await response.json();
};
