// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as msRest from '@azure/ms-rest-js';

import logger from './../../logger';

const log = logger.extend('feed-manager');

// http client for fetch json feed from url
const clientOptions: msRest.ServiceClientOptions = {
  requestPolicyFactories: [msRest.logPolicy(log)],
};
const token = process.env.ACCESS_TOKEN || 'token';
const creds = new msRest.TokenCredentials(token);
const client = new msRest.ServiceClient(creds, clientOptions);

// TODO: update feed url to main
const feedUrl = 'https://api.jsonbin.io/b/6066712c7474c23d9027bf10/3';

export const getFeedUrl = async (): Promise<any> => {
  const { bodyAsText: content } = await client.sendRequest({
    url: feedUrl,
    method: 'GET',
  });

  return content && typeof content === 'string' ? JSON.parse(content) : {};
};
