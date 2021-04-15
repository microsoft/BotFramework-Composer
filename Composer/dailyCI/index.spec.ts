// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';

import { sleep } from './uitils';
import {
  getPublishStatus,
  setAppsettings,
  startPublish,
  getProjectTemplates,
  createSampleBot,
  getJobStatus,
} from './composerApi';
import { getAccessToken } from './azureTokenUtils';
import { DirectLineUtils } from './directLineUtils';

jest.setTimeout(1000 * 60 * 10);

const publishTarget = 'myPublishProfile';

const directlineToken =
  process.env.DAILY_CI_DIRECTLINE_TOKEN ?? '6D1fgCTy60c.20i46J2iwNR2RKI9yxsZTcf1YhMKKa4bo-kZtLLPVOQ';

async function getPublishProfile() {
  const publishFileStr = process.env.DAILY_CI_PUBLISH_FILE;
  if (!publishFileStr) {
    const publishFilePath = path.resolve(__dirname, 'publishFile.json');
    return await fs.readJSON(publishFilePath);
  } else {
    return JSON.parse(publishFileStr.trim());
  }
}

async function setAppSettings(token: string, botId: string, botName: string) {
  const publishProfile = await getPublishProfile();
  console.log('getPublishProfile');
  publishProfile.accessToken = token;
  const publishProfileStr = JSON.stringify(publishProfile);

  const defaultSettingsPath = path.resolve(__dirname, 'defaultSettings.json');
  const defaultSettings = await fs.readJSON(defaultSettingsPath);
  defaultSettings.luis.name = botName;
  defaultSettings.luis.authoringKey = publishProfile.settings.luis.authoringKey;
  defaultSettings.luis.endpointKey = publishProfile.settings.luis.endpointKey;
  defaultSettings.qna.subscriptionKey = publishProfile.settings.qna.subscriptionKey;
  defaultSettings.runtime.command = `dotnet run --project ${botName}.csproj`;
  defaultSettings.publishTargets = [
    {
      name: publishTarget,
      type: 'azurePublish',
      configuration: publishProfileStr,
      lastPublished: Date.now(),
    },
  ];

  return await setAppsettings(defaultSettings, botId);
}

function ensureDir() {
  const botPath = path.resolve(__dirname, '../../../Bots');
  if (!fs.pathExistsSync(botPath)) {
    fs.mkdirSync(botPath);
  } else {
    const state = fs.lstatSync(botPath);
    if (!state.isDirectory()) {
      fs.mkdirSync(botPath);
    }
  }
  return botPath;
}

async function createTemplateProject(templateName: string, templateVersion: string) {
  const botFolder = ensureDir();
  console.log(botFolder);

  let retryCount = 40;
  const response = await createSampleBot(templateName, templateVersion, botFolder);
  console.log('createSampleBot');
  let responseData = undefined;
  while (retryCount > 0) {
    responseData = await getJobStatus(response.jobId);
    console.log('getJobStatus');
    console.log(responseData);
    if (responseData.statusCode === 200 && responseData.message === 'Created Successfully') {
      break;
    }

    await sleep(10000);
    retryCount--;
  }

  if (retryCount <= 0) {
    throw new Error('Get getJobStatus failed.');
  }

  return responseData;
}

async function publishBot(botId: string, botName: string, metadata): Promise<boolean> {
  const tokenResponse = await getAccessToken();
  console.log('get access token');
  const jsonResult = JSON.parse(tokenResponse);
  const token = jsonResult.accessToken;

  const updateSettingsResult = await setAppSettings(token, botId, botName);
  console.log('setAppSettings');
  if (!updateSettingsResult) {
    return false;
  }

  const publishFile = await getPublishProfile();
  console.log('getPublishProfile');
  const startPublishResult = await startPublish(token, botId, publishTarget, metadata, publishFile, botName);
  console.log('startPublish');
  if (!startPublishResult) {
    return false;
  }

  let message = undefined;
  while (message !== 'Success') {
    const statusResult = await getPublishStatus(botId, publishTarget, startPublishResult.id);
    console.log('getPublishStatus');
    if (!statusResult) {
      return false;
    }
    message = statusResult?.message;
    await sleep(10000);
  }
  return true;
}

describe('test sample bot', () => {
  it('run test', async () => {
    const templates = await getProjectTemplates();
    console.log('get project templates');
    if (!Array.isArray(templates)) {
      throw new Error('templates is not array.');
    }

    const testDataPath = path.resolve(__dirname, 'testData.json');
    const testData = await fs.readJSON(testDataPath);

    for (const template of templates) {
      const packageName = template?.package?.packageName;
      const packageVersion = template?.package?.packageVersion;
      const templateSettings = testData.filter((u) => u.packageName === packageName);

      if (templateSettings.length === 0) {
        continue;
      }

      const templatesetting = templateSettings[0];
      const projectInfo = await createTemplateProject(packageName, packageVersion);
      console.log('create template project');

      const botId = projectInfo.result.id;
      const botName = projectInfo.result.botName;

      // publish test
      const publishResult = await publishBot(botId, botName, templatesetting.metadata);
      console.log('publish bot');
      expect(publishResult).toBeTruthy();

      // flow test
      const tester = new DirectLineUtils(directlineToken);
      const tests = templatesetting.testdata;
      for (const test of tests) {
        const results = await tester.sendAndGetMessages(test.sendMessage);
        console.log('publish bot');
        const expectedResults = test.expectedResults;
        expect(expectedResults).toContain(results[0].trim());
      }
    }
  });
});
