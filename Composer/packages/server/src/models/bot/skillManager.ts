// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as msRest from '@azure/ms-rest-js';

import logger from './../../logger';

const log = logger.extend('skill-manager');

// http client for fetch skill data from manifest url
const clientOptions: msRest.ServiceClientOptions = {
  requestPolicyFactories: [msRest.logPolicy(log)],
};
const token = process.env.ACCESS_TOKEN || 'token';
const creds = new msRest.TokenCredentials(token);
const client = new msRest.ServiceClient(creds, clientOptions);

export const getSkillManifest = async (url: string): Promise<any> => {
  const { bodyAsText: content } = await client.sendRequest({
    url,
    method: 'GET',
  });

  return typeof content === 'string' ? JSON.parse(content) : {};
};
