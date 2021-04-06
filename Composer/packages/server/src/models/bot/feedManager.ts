// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import axios from 'axios';

// TODO: update feed url
const feedUrl = 'https://aka.ms/composer-feed-json-test';

export const getFeedUrl = async (): Promise<any> => {
  const { data: content } = await axios({
    method: 'get',
    url: feedUrl,
  });
  return content && typeof content === 'string' ? JSON.parse(content) : content;
};
