// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as msRest from '@azure/ms-rest-js';
import { SkillSetting, Diagnostic, DiagnosticSeverity } from '@bfc/shared';
import toPairs from 'lodash/toPairs';

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

export const retrieveSkillManifests = async (skillSettings?: { [name: string]: SkillSetting } | SkillSetting[]) => {
  const skills = toPairs(skillSettings);

  const diagnostics: Diagnostic[] = [];
  const skillManifests: any = [];

  for (const [id, { manifestUrl }] of skills) {
    try {
      const content = await getSkillManifest(manifestUrl);

      skillManifests.push({ content, id, manifestUrl });
    } catch (error) {
      const notify = new Diagnostic(
        `Accessing skill manifest url error, ${manifestUrl}`,
        'appsettings.json',
        DiagnosticSeverity.Warning
      );
      diagnostics.push(notify);
      skillManifests.push({ id, manifestUrl });
    }
  }

  return { diagnostics, skillManifests };
};
