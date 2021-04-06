// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, SensitiveProperties } from '@bfc/shared';
import { UserIdentity } from '@bfc/extension';
import has from 'lodash/has';
import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import omit from 'lodash/omit';

import { Path } from '../../utility/path';
import log from '../../logger';

import { FileSettingManager } from './fileSettingManager';
const debug = log.extend('default-settings-manager');

const newSettingsValuePath = [
  'downsampling',
  'luis.endpoint',
  'luis.authoringEndpoint',
  'skillConfiguration',
  'customFunctions',
];

const discardedSettingsValuePath = ['downsampling.maxUtteranceAllowed'];

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
        UseSetSpeakMiddleware: true,
      },
      MicrosoftAppPassword: '',
      MicrosoftAppId: '',
      cosmosDb: {
        authKey: '',
        containerId: 'botstate-container',
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
      speech: {
        voiceFontName: 'en-US-AriaNeural',
        fallbackToTextForSpeechIfEmpty: true,
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
        directVersionPublish: true,
      },
      luFeatures: {
        enablePattern: true,
        enableMLEntities: true,
        enableListEntities: true,
        enableCompositeEntities: true,
        enablePrebuiltEntities: true,
        enableRegexEntities: true,
        enablePhraseLists: true,
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
        key: '',
      },
      downsampling: {
        maxImbalanceRatio: -1,
      },
      skillConfiguration: {
        // TODO: Setting isSkill property to true for now. A runtime change is required to remove dependancy on isSkill prop #4501
        isSkill: true,
        allowedCallers: [],
      },
      skill: {},
      defaultLanguage: 'en-us',
      languages: ['en-us'],
      customFunctions: [],
      importedLibraries: [],
    };
  };

  public async get(obfuscate = false): Promise<any> {
    const result = await super.get(obfuscate);
    const defaultValue = this.createDefaultSettings();
    let updateFile = false;
    newSettingsValuePath.forEach((jsonPath: string) => {
      if (!has(result, jsonPath)) {
        set(result, jsonPath, get(defaultValue, jsonPath));
        updateFile = true;
      }
    });

    discardedSettingsValuePath.forEach((jsonPath: string) => {
      if (has(result, jsonPath)) {
        unset(result, jsonPath);
        updateFile = true;
      }
    });

    if (updateFile) {
      this.set(result);
    }
    return result;
  }

  public set = async (settings: DialogSetting): Promise<void> => {
    const path = this.getPath();
    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      debug('Storage path does not exist. Creating directory now: %s', dir);
      await this.storage.mkDir(dir, { recursive: true });
    }
    // remove sensitive values before saving to disk
    const settingsWithoutSensitive = omit(settings, SensitiveProperties);

    this.storage.writeFileSync(path, JSON.stringify(settingsWithoutSensitive, null, 2));
  };
}
