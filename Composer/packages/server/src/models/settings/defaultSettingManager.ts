// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import omit from 'lodash/omit';
import { SensitiveProperties } from '@bfc/shared';
import { UserIdentity, JSONSchema7 } from '@bfc/plugin-loader';

import { Path } from '../../utility/path';
import log from '../../logger';

import { FileSettingManager } from './fileSettingManager';

const debug = log.extend('default-settings-manager');

export class DefaultSettingManager extends FileSettingManager {
  public schema: JSONSchema7;
  constructor(basePath: string, user?: UserIdentity) {
    super(basePath, user);
    this.schema = {
      type: 'object',
      properties: {
        MicrosoftAppId: {
          type: 'string',
        },
        MicrosoftAppPassword: {
          type: 'string',
        },
        luis: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            authoringKey: {
              type: 'string',
            },
            endpointKey: {
              type: 'string',
            },
            authoringRegion: {
              type: 'string',
            },
            defaultLanguage: {
              type: 'string',
            },
            environment: {
              type: 'string',
            },
          },
        },
        feature: {
          type: 'object',
          properties: {
            UseShowTypingMiddleware: {
              type: 'boolean',
            },
            UseInspectionMiddleware: {
              type: 'boolean',
            },
          },
        },
        publishTargets: {
          type: 'array',
        },
        qna: {
          type: 'object',
          properties: {
            knowledgebaseid: {
              type: 'string',
            },
            endpointkey: {
              type: 'string',
            },
            hostname: {
              type: 'string',
            },
          },
        },
        telemetry: {
          type: 'object',
          properties: {
            logPersonalInformation: {
              type: 'boolean',
            },
            logActivities: {
              type: 'boolean',
            },
          },
        },
        runtime: {
          type: 'object',
          properties: {
            customRuntime: {
              type: 'boolean',
            },
            path: {
              type: 'string',
            },
            command: {
              type: 'string',
            },
          },
        },
        downsampling: {
          type: 'object',
          properties: {
            maxImbalanceRatio: {
              type: 'number',
            },
            maxUtteranceAllowed: {
              type: 'number',
            },
          },
        },
      },
      default: this.createDefaultSettings(),
    };
  }

  protected createDefaultSettings = (): any => {
    return {
      feature: {
        UseShowTypingMiddleware: false,
        UseInspectionMiddleware: false,
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
