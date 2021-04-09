// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';

import { getPublishProfile, sleep } from './uitils';
import { getPublishStatus, setAppsettings, startPublish } from './composerApi';
import { getAccessToken } from './azureTokenUtils';

export class ComposerUtils {
  private botId: string;
  private botName: string;
  public constructor(botId: string, botName: string) {
    this.botId = botId;
    this.botName = botName;
  }

  public async publishBot(): Promise<boolean> {
    const tokenResponse = await getAccessToken();
    const jsonResult = JSON.parse(tokenResponse);
    const token = jsonResult.accessToken;
    const targetName = 'testPublish';
    const updateSettingsResult = await this.setAppSettings(token, targetName);

    if (!updateSettingsResult) {
      return false;
    }
    const startPublishResult = await startPublish(token, this.botId, targetName);
    if (!startPublishResult) {
      return false;
    }

    let message = undefined;
    while (message !== 'Success') {
      const statusResult = await getPublishStatus(this.botId, targetName);
      if (!statusResult) {
        return false;
      }
      message = statusResult;
      await sleep(5000);
    }
    return true;
  }

  private async setAppSettings(token: string, targetName: string) {
    const publishProfile = getPublishProfile();
    publishProfile.accessToken = token;
    const publishProfileStr = JSON.stringify(publishProfile);

    const defaultSettingsPath = path.resolve(__dirname, 'defaultPublishSettings.json');
    const defaultSettings = await fs.readJSON(defaultSettingsPath);
    defaultSettings.luis.name = this.botName;
    defaultSettings.publishTargets = [
      {
        name: targetName,
        type: 'azurePublish',
        configuration: publishProfileStr,
        lastPublished: Date.now(),
      },
    ];

    return await setAppsettings(defaultSettings, this.botId);
  }
}
