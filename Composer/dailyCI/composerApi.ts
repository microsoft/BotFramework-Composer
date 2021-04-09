// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as axios from 'axios';

import { isSuccessful } from './uitils';

const host = 'http://localhost:3000';
const botName = 'E2ESample';
const botPath = 'D:/Bots';

export async function getProjectTemplates(): Promise<Record<string, unknown>[]> {
  const response = await axios.default({
    url: `${host}/api/v2/assets/projectTemplates`,
    method: 'POST',
    data: {
      getFirstPartyNpm: false,
      feedUrls: ['https://registry.npmjs.org/-/v1/search?text=generator+keywords:bf-template+scope:microsoft'],
    },
  });
  if (!isSuccessful(response.status)) {
    throw new Error('GetProjectTemplates failed.');
  }

  return response.data;
}

export async function createsampleBot(data?: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!data || !data.templateId || !data.templateVersion) {
    throw new Error('The sample data is not valid.');
  }
  const response = await axios.default({
    url: `${host}/api/v2/projects`,
    method: 'POST',
    data: {
      description: 'MyDescription',
      location: botPath,
      name: botName,
      runtimeLanguage: 'dotnet',
      runtimeType: 'webapp',
      schemaUrl: '',
      storageId: 'default',
      templateId: data.templateId,
      templateVersion: data.templateVersion,
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('CreatesampleBot failed.');
  }

  return response.data;
}

export async function setAppsettings(defaultSettings: Record<string, unknown>, botId: string) {
  const response = await axios.default({
    url: `${host}/api/projects/${botId}/files/appsettings.json`,
    method: 'PUT',
    data: {
      content: JSON.stringify(defaultSettings),
      name: 'appsettings.json',
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('CreatesampleBot failed.');
  }

  return response.data;
}

export async function startPublish(token: string, botId: string, targetName: string) {
  const response = await axios.default({
    url: `${host}/api/publish/${botId}/publish/${targetName}`,
    method: 'POST',
    data: {
      accessToken: token,
      metadata: {
        luResources: [],
        qnaResources: [],
      },
      sensitiveSettings: {
        MicrosoftAppPassword: '',
        luis: {
          endpointKey: '',
          authoringKey: '',
        },
        qna: {
          endpointKey: '',
          subscriptionKey: '',
        },
      },
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('CreatesampleBot failed.');
  }

  return response.data;
}

export async function getPublishStatus(botId: string, targetName: string) {
  const response = await axios.default({
    url: `${host}/api/publish/${botId}/status/${targetName}`,
    method: 'GET',
  });

  if (!isSuccessful(response.status)) {
    throw new Error('GetPublishStatus failed.');
  }

  return response.data;
}
