// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import * as msRest from '@azure/ms-rest-js';
import { Skill, Diagnostic, DiagnosticSeverity } from '@bfc/shared';

import logger from './../../logger';

const log = logger.extend('skill-manager');

// http client for fetch skill data from manifest url
const clientOptions: msRest.ServiceClientOptions = {
  requestPolicyFactories: [msRest.logPolicy(log)],
};
const token = process.env.ACCESS_TOKEN || 'token';
const creds = new msRest.TokenCredentials(token);
const client = new msRest.ServiceClient(creds, clientOptions);

export const getSkillByUrl = async (url: string, name?: string): Promise<Skill> => {
  try {
    const req: msRest.RequestPrepareOptions = {
      url,
      method: 'GET',
    };

    const res: msRest.HttpOperationResponse = await client.sendRequest(req);

    if (res.status >= 400) {
      throw new Error('Manifest url can not be accessed.');
    }

    const resBody = typeof res.bodyAsText === 'string' && JSON.parse(res.bodyAsText);
    return {
      manifestUrl: url,
      name: name || resBody?.name || '',
      description: resBody?.description || '',
      endpoints: get(resBody, 'endpoints', []),
      endpointUrl: get(resBody, 'endpoints[0].endpointUrl', ''), // needs more invesment on endpoint
      protocol: get(resBody, 'endpoints[0].protocol', ''),
      msAppId: get(resBody, 'endpoints[0].msAppId', ''),
      body: res.bodyAsText,
    };
  } catch (error) {
    throw new Error('Manifest url can not be accessed.');
  }
};

export const extractSkillManifestUrl = async (
  skills: Skill[]
): Promise<{ skillsParsed: Skill[]; diagnostics: Diagnostic[] }> => {
  const skillsParsed: Skill[] = [];
  const diagnostics: Diagnostic[] = [];
  for (const skill of skills) {
    const { manifestUrl, name } = skill;
    try {
      const parsedSkill = await getSkillByUrl(manifestUrl, name);
      skillsParsed.push(parsedSkill);
    } catch (error) {
      const notify = new Diagnostic(
        `Accessing skill manifest url error, ${manifestUrl}`,
        'appsettings.json',
        DiagnosticSeverity.Warning
      );
      diagnostics.push(notify);
    }
  }
  return { skillsParsed, diagnostics };
};
