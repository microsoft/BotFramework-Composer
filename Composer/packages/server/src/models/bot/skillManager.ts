// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import * as msRest from '@azure/ms-rest-js';
import { Skill } from '@bfc/shared';

import log from './../../logger';

// http client for fetch skill data from manifest url
const clientOptions: msRest.ServiceClientOptions = {
  requestPolicyFactories: [msRest.logPolicy(log)],
};
const token = process.env.ACCESS_TOKEN || 'token';
const creds = new msRest.TokenCredentials(token);
const client = new msRest.ServiceClient(creds, clientOptions);

export const extractSkillManifestUrl = async (skills: any[]): Promise<Skill[]> => {
  const skillsParsed: Skill[] = [];
  for (const skill of skills) {
    const { manifestUrl, name } = skill;
    try {
      const req: msRest.RequestPrepareOptions = {
        url: manifestUrl,
        method: 'GET',
      };

      const res: msRest.HttpOperationResponse = await client.sendRequest(req);

      const resBody = typeof res.bodyAsText === 'string' && JSON.parse(res.bodyAsText);
      skillsParsed.push({
        manifestUrl,
        name: name || resBody?.name || '',
        description: resBody?.description || '',
        endpoints: get(resBody, 'endpoints', []),
        endpointUrl: get(resBody, 'endpoints[0].endpointUrl', ''), // needs more invesment on endpoint
        protocol: get(resBody, 'endpoints[0].protocol', ''),
        msAppId: get(resBody, 'endpoints[0].msAppId', ''),
        body: res.bodyAsText,
      });
      continue;
    } catch (error) {
      throw new Error('Manifest url can not be accessed.');
    }
    skillsParsed.push(skill);
  }
  return skillsParsed;
};
