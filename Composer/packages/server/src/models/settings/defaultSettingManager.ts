// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import omit from 'lodash/omit';
import { SensitiveProperties as defaultSensitiveProperties } from '@bfc/shared';

import { Path } from '../../utility/path';

import { FileSettingManager } from './fileSettingManager';

export class DefaultSettingManager extends FileSettingManager {
  constructor(basePath: string) {
    super(basePath);
  }

  protected createDefaultSettings = (): any => {
    return {
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
      qna: {
        knowledgebaseid: '',
        endpointkey: '',
        hostname: '',
      },
    };
  };

  private filterOutSensitiveValue = (obj: any) => {
    const SensitiveProperties = obj.SensitiveProperties || defaultSensitiveProperties;
    if (obj && typeof obj === 'object') {
      return omit(obj, SensitiveProperties);
    }
  };

  public set = async (slot: string, settings: any): Promise<void> => {
    this.validateSlot(slot);

    const path = this.getPath(slot);
    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      await this.storage.mkDir(dir, { recursive: true });
    }
    // remove sensitive values before saving to disk
    const settingsWithoutSensitive = this.filterOutSensitiveValue(settings);

    await this.storage.writeFile(path, JSON.stringify(settingsWithoutSensitive, null, 2));
  };
}
