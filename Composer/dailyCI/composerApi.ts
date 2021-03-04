// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';

export class ComposerApi {
  public async CreateLuisBotProject(): Promise<any> {
    const endpoint = `http://localhost:3000/api/projects`;
    const location = __dirname;
    const botName = `ToDoBotWithLuisSample-${uuidv4()}`;
    const response = await axios.default({
      url: endpoint,
      method: 'POST',
      data: {
        storageId: 'default',
        templateId: 'ToDoBotWithLuisSample',
        name: botName,
        description: '',
        location: location,
        schemaUrl: '',
      },
    });

    // temp workaround for recognizers and crosstrain.config
    const botLocation = path.resolve(location, botName);

    const crossTrainConfigPath = path.resolve(botLocation, 'settings', 'cross-train.config.json');
    const keyName = `${botName}.en-us`;
    const crossTrainConfig = {
      [keyName]: {
        rootDialog: true,
        triggers: {
          Add: ['additem.en-us'],
          Delete: ['deleteitem.en-us'],
          View: ['viewitem.en-us'],
          UserProfile: ['userprofile.en-us'],
          cancel: [],
        },
      },
      'userprofile.en-us': {
        rootDialog: false,
        triggers: {
          Cancel: [],
          Why: [],
          NoValue: [],
        },
      },
    };
    await fs.writeJson(crossTrainConfigPath, crossTrainConfig);

    const recognizersFolderPath = path.resolve(botLocation, 'recognizers');
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(recognizersFolderPath);

    const enLuDialog = {
      $kind: 'Microsoft.LuisRecognizer',
      id: `LUIS_${botName}`,
      applicationId: `=settings.luis.${botName.replace(/[.-]/g, '_')}_en_us_lu.appId`,
      version: `=settings.luis.${botName.replace(/[.-]/g, '_')}_en_us_lu.version`,
      endpoint: '=settings.luis.endpoint',
      endpointKey: '=settings.luis.endpointKey',
    };
    await fs.writeJson(path.resolve(recognizersFolderPath, `${botName}.en-us.lu.dialog`), enLuDialog, {
      spaces: 2,
    });

    const luDialog = {
      $kind: 'Microsoft.MultiLanguageRecognizer',
      id: `LUIS_${botName}`,
      recognizers: {
        'en-us': `${botName}.en-us.lu`,
        '': `${botName}.en-us.lu`,
      },
    };
    await fs.writeJson(path.resolve(recognizersFolderPath, `${botName}.lu.dialog`), luDialog, {
      spaces: 2,
    });

    const qnaDialog = {
      $kind: 'Microsoft.CrossTrainedRecognizerSet',
      recognizers: [`${botName}.lu`],
    };
    await fs.writeJson(path.resolve(recognizersFolderPath, `${botName}.lu.qna.dialog`), qnaDialog, {
      spaces: 2,
    });

    return response.data;
  }

  public async SetAppSettings(token: string, botId: string, botName: string, targetName: string) {
    try {
      const endpoint = `http://localhost:3000/api/projects/${botId}/files/appsettings.json`;

      // const publishProfilePath = path.resolve(__dirname, 'profile.json');
      // const publishProfile = await fs.readJSON(publishProfilePath);

      const publishProfile = this.GetPublishProfile();
      publishProfile.accessToken = token;
      const publishProfileStr = JSON.stringify(publishProfile);

      const defaultSettingsPath = path.resolve(__dirname, 'defaultSettings.json');
      const defaultSettings = await fs.readJSON(defaultSettingsPath);
      defaultSettings.luis.name = botName;
      defaultSettings.publishTargets = [
        {
          name: targetName,
          type: 'azurePublish',
          configuration: publishProfileStr,
          lastPublished: Date.now(),
        },
      ];
      console.log('default settings:');
      console.log(defaultSettings);
      const response = await axios.default({
        url: endpoint,
        method: 'PUT',
        data: {
          content: JSON.stringify(defaultSettings),
          name: 'appsettings.json',
        },
      });

      return response.data;
    } catch (error) {
      console.log('%O', error);
      return undefined;
    }
  }

  public async StartPublish(token: string, botId: string, botName: string, targetName: string) {
    try {
      const endpoint = `http://localhost:3000/api/publish/${botId}/publish/${targetName}`;

      const response = await axios.default({
        url: endpoint,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          accessToken: token,
          metadata: {
            comment: '',
            luResources: [
              {
                id: 'additem.en-us',
                isEmpty: false,
              },
              {
                id: 'deleteitem.en-us',
                isEmpty: false,
              },
              {
                id: 'userprofile.en-us',
                isEmpty: false,
              },
              {
                id: 'viewitem.en-us',
                isEmpty: false,
              },
              {
                id: `${botName}.en-us`,
                isEmpty: false,
              },
            ],
            qnaResources: [
              {
                id: 'additem.en-us',
                isEmpty: true,
              },
              {
                id: 'deleteitem.en-us',
                isEmpty: true,
              },
              {
                id: 'help.en-us',
                isEmpty: true,
              },
              {
                id: 'userprofile.en-us',
                isEmpty: true,
              },
              {
                id: 'viewitem.en-us',
                isEmpty: true,
              },
              {
                id: `${botName}.en-us`,
                isEmpty: true,
              },
            ],
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
      // console.log(response)
      return response;
    } catch (error) {
      console.log('%O', error);
      return undefined;
    }
  }

  public async GetPublishStatus(botId: string, targetName: string) {
    try {
      const endpoint = `http://localhost:3000/api/publish/${botId}/status/${targetName}`;
      const response = await axios.default({
        url: endpoint,
        method: 'GET',
      });

      const message = response.data.message;
      return message;
    } catch (error) {
      console.log('%O', error);
      return undefined;
    }
  }

  private GetPublishProfile() {
    const publishFile = process.env.DAILY_CI_PUBLISH_FILE;
    if (!publishFile) {
      throw Error('Could not find publish file.');
    }

    const publishFileJson = JSON.parse(publishFile.trim());
    publishFileJson.accessToken = '';
    return publishFileJson;
  }
}
