// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import omit from 'lodash/omit';
import { SensitiveProperties } from '@bfc/shared';
import { UserIdentity } from '@bfc/plugin-loader';

import { Path } from '../../utility/path';
import log from '../../logger';

import { FileSettingManager } from './fileSettingManager';

const debug = log.extend('default-settings-manager');

export class DefaultSettingManager extends FileSettingManager {
  constructor(basePath: string, user?: UserIdentity) {
    super(basePath, user);
  }

  protected createDefaultSettings = (): any => {
    return {
      feature: {
        UseTranscriptLoggerMiddleware: false,
        UseShowTypingMiddleware: false,
        UseInspectionMiddleware: false,
        UseCosmosDbPersistentStorage: false,
      },
      MicrosoftAppPassword: '',
      MicrosoftAppId: '',
      luis: {
        name: '',
        authoringKey: '',
        endpointKey: '',
        authoringRegion: 'westus',
        defaultLanguage: 'en-us',
        environment: 'composer',
      },
      publishTargets: [],
      qna: {
        knowledgebaseid: '',
        endpointkey: '',
        hostname: '',
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
    };
  };

  public async get(slot = '', obfuscate = false): Promise<any> {
    const result = await super.get(slot, obfuscate);
    //add downsampling property for old bot
    if (!result.downsampling) {
      result.downsampling = this.createDefaultSettings().downsampling;
    }
    return result;
  }

  private filterOutSensitiveValue = (obj: any) => {
    if (obj && typeof obj === 'object') {
      return omit(obj, SensitiveProperties);
    }
  };

  public set = async (slot: string, settings: any): Promise<void> => {
    this.validateSlot(slot);

    const path = this.getPath(slot);
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
