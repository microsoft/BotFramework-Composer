// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { isSuccessful } from './uitils';

const host = 'http://localhost:3000';

/**
 * Get all built-in templates.
 */
export async function getProjectTemplates() {
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

/**
 * Create template bot with package.
 * @param packageName The package name.
 * @param packageVersion The package version.
 */
export async function createSampleBot(packageName: string, packageVersion: string) {
  if (!packageName || !packageVersion) {
    throw new Error('The sample data is not valid.');
  }
  const response = await axios.default({
    url: `${host}/api/v2/projects`,
    method: 'POST',
    data: {
      description: 'description',
      location: __dirname, // TODO
      name: 'testBot' + uuidv4().replace(/-/g, ''),
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

  return response.data;
}

/**
 * Get job status of the creation.
 * @param jobId job id.
 */
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

  return response.data;
}

/**
 * Post app settings.
 * @param defaultSettings Default app settings.
 * @param botId Bot id.
 */
export async function setAppsettings(defaultSettings, botId: string) {
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

/**
 * Publish Bot.
 * @param token Access token.
 * @param botId Bot id.
 * @param targetName Publish target name.
 * @param metadata Publish metadata.
 * @param publishFile Publish file.
 * @param botName Bot Name.
 */
export async function startPublish(
  token: string,
  botId: string,
  targetName: string,
  metadata,
  publishFile,
  botName: string
) {
  try {
    const luResources = metadata.luResources;
    luResources[luResources.length - 1].id = `${botName}.en-us`;
    const qnaResources = metadata.qnaResources;
    qnaResources[qnaResources.length - 1].id = `${botName}.en-us`;
    const response = await axios.default({
      url: `${host}/api/publish/${botId}/publish/${targetName}`,
      method: 'POST',
      data: {
        accessToken: token,
        metadata: {
          luResources: luResources,
          qnaResources: qnaResources,
        },
        sensitiveSettings: {
          MicrosoftAppPassword: '',
          luis: {
            endpointKey: publishFile.settings.luis.endpointKey,
            authoringKey: publishFile.settings.luis.authoringKey,
          },
          qna: {
            endpointKey: '',
            subscriptionKey: publishFile.settings.qna.subscriptionKey,
          },
        },
      },
    });

    if (!isSuccessful(response.status)) {
      throw new Error('CreatesampleBot failed.');
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Get publish status.
 * @param botId Bot id.
 * @param targetName Publish target name.
 * @param jobId Job id.
 */
export async function getPublishStatus(botId: string, targetName: string, jobId: string) {
  const response = await axios.default({
    url: `${host}/api/publish/${botId}/status/${targetName}/${jobId}`,
    method: 'GET',
  });

  if (!isSuccessful(response.status)) {
    throw new Error('GetPublishStatus failed.');
  }
  return response.data;
}
