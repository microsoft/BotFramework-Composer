// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { isSuccessful } from './uitils';

const host = 'http://localhost:3000';

export async function getProjectTemplates() {
  console.log('get templates');
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
  console.log(response.data);
  return response.data;
}

export async function createSampleBot(packageName: string, packageVersion: string) {
  console.log(`create sample bot of template: ${packageName}@${packageVersion}`);
  if (!packageName || !packageVersion) {
    throw new Error('The sample data is not valid.');
  }
  const response = await axios.default({
    url: `${host}/api/v2/projects`,
    method: 'POST',
    data: {
      description: 'description',
      location: 'D:/Bots', // TODO
      name: 'testBot_' + uuidv4().replace(/-/g, '_'),
      runtimeLanguage: 'dotnet',
      runtimeType: 'webapp',
      schemaUrl: '',
      storageId: 'default',
      templateId: packageName,
      templateVersion: packageVersion,
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('CreatesampleBot failed.');
  }

  console.log(`create template job ${packageName}@${packageVersion} successfully.`);
  return response.data;
}

export async function getJobStatus(jobId: string) {
  if (!jobId) {
    throw new Error('The job ID is not valid.');
  }
  const response = await axios.default({
    url: `${host}/api/status/${jobId}`,
    method: 'GET',
  });

  if (!isSuccessful(response.status)) {
    throw new Error('getJobStatus failed.');
  }
  console.log(`get job ${jobId} status: ${response?.data?.message}`);
  return response.data;
}

export async function setAppsettings(defaultSettings, botId: string) {
  console.log(`set settings for bot: ${botId}`);
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

  console.log(response.data);
  return response.data;
}

export async function startPublish(token: string, botId: string, targetName: string, metadata) {
  console.log(`start publish bot: ${botId}`);
  const response = await axios.default({
    url: `${host}/api/publish/${botId}/publish/${targetName}`,
    method: 'POST',
    data: {
      accessToken: token,
      metadata: metadata,
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

  console.log(response.data);

  return response.data;
}

export async function getPublishStatus(botId: string, targetName: string) {
  console.log(`get publish status of bot: ${botId}`);
  const response = await axios.default({
    url: `${host}/api/publish/${botId}/status/${targetName}`,
    method: 'GET',
  });

  if (!isSuccessful(response.status)) {
    throw new Error('GetPublishStatus failed.');
  }
  console.log(response.data);
  return response.data;
}
