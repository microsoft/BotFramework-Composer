// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import * as msRest from '@azure/ms-rest-js';

// http client for fetch skill data from manifest url
const clientOptions: msRest.ServiceClientOptions = {
  requestPolicyFactories: [msRest.logPolicy()],
};
const token = process.env.ACCESS_TOKEN || 'token';
const creds = new msRest.TokenCredentials(token);
const client = new msRest.ServiceClient(creds, clientOptions);

export const extractSkillManifestUrl = async (skills: any[]): Promise<any[]> => {
  const skillsParsed: any[] = [];
  for (const skill of skills) {
    const { manifestUrl, name } = skill;
    if (manifestUrl && !name) {
      const req: msRest.RequestPrepareOptions = {
        url: manifestUrl,
        method: 'GET',
      };

      try {
        const res: msRest.HttpOperationResponse = await client.sendRequest(req);

        const resBody = typeof res.bodyAsText === 'string' && JSON.parse(res.bodyAsText);
        skillsParsed.push({
          manifestUrl,
          name: resBody?.name || '',
          description: resBody?.description || '',
          endpointUrl: get(resBody, 'endpoints[0].endpointUrl', ''), // needs more invesment on endpoint
          msAppId: get(resBody, 'endpoints[0].msAppId', ''),
        });
        continue;
      } catch (error) {
        // pass
      }
    }
    skillsParsed.push(skill);
  }
  return skillsParsed;
};
