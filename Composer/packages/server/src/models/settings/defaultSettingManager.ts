// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import set from 'lodash/set';
import { DialogSetting, SensitiveProperties } from '@bfc/shared';
import { UserIdentity } from '@bfc/extension';

import { Path } from '../../utility/path';
import log from '../../logger';

import { FileSettingManager } from './fileSettingManager';
const debug = log.extend('default-settings-manager');

export class DefaultSettingManager extends FileSettingManager {
  constructor(basePath: string, user?: UserIdentity) {
    super(basePath, user);
  }

  protected createDefaultSettings = (): DialogSetting => {
    return {
      feature: {
        UseShowTypingMiddleware: false,
        UseInspectionMiddleware: false,
        RemoveRecipientMention: false,
      },
      MicrosoftAppPassword: '',
      MicrosoftAppId: '',
      cosmosDb: {
        authKey: '',
        collectionId: 'botstate-collection',
        cosmosDBEndpoint: '',
        databaseId: 'botstate-db',
      },
      applicationInsights: {
        InstrumentationKey: '',
      },
      blobStorage: {
        connectionString: '',
        container: 'transcripts',
      },
      luis: {
        name: '',
        authoringKey: '',
        authoringEndpoint: '',
        endpointKey: '',
        endpoint: '',
        authoringRegion: 'westus',
        defaultLanguage: 'en-us',
        environment: 'composer',
      },
      publishTargets: [],
      qna: {
        subscriptionKey: '',
        knowledgebaseid: '',
        endpointKey: '',
        hostname: '',
        qnaRegion: 'westus',
      },
      telemetry: {
        logPersonalInformation: false,
        logActivities: true,
      },
      runtime: {
        customRuntime: false,
        path: '',
        command: '',
      },
      downsampling: {
        maxImbalanceRatio: 10,
        maxUtteranceAllowed: 15000,
      },
      skillConfiguration: {
        isSkill: false,
        allowedCallers: ['*'],
      },
      skill: {},
      defaultLanguage: 'en-us',
      languages: ['en-us'],
    };
  };

  public async get(obfuscate = false): Promise<any> {
    const result = await super.get(obfuscate);
    //add downsampling property for old bot
    if (!result.downsampling) {
      result.downsampling = this.createDefaultSettings().downsampling;
    }
    //add luis endpoint for old bot
    if (!result.luis.endpoint && result.luis.endpoint !== '') {
      result.luis.endpoint = this.createDefaultSettings().luis.endpoint;
    }
    //add luis authoring endpoint for old bot
    if (!result.luis.authoringEndpoint && result.luis.authoringEndpoint !== '') {
      result.luis.authoringEndpoint = this.createDefaultSettings().luis.authoringEndpoint;
    }
    return result;
  }

  private filterOutSensitiveValue = (obj: any) => {
    if (obj && typeof obj === 'object') {
      SensitiveProperties.map((key) => {
        set(obj, key, '');
      });
      return obj;
    }
  };

  public set = async (settings: any): Promise<void> => {
    const path = this.getPath();
    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      debug('Storage path does not exist. Creating directory now: %s', dir);
      await this.storage.mkDir(dir, { recursive: true });
    }
    // remove sensitive values before saving to disk
    const settingsWithoutSensitive = this.filterOutSensitiveValue(settings);

    await this.storage.writeFile(path, JSON.stringify(settingsWithoutSensitive, null, 2));
  };
}
