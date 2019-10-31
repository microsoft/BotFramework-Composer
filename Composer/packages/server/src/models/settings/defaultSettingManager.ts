// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { set } from 'lodash';

import { Path } from '../../utility/path';

import { FileSettingManager } from './fileSettingManager';
import { SensitiveProperties } from './interface';

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
    if (obj && typeof obj === 'object') {
      SensitiveProperties.map(property => {
        set(obj, property, '');
      });
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
    this.filterOutSensitiveValue(settings);

    await this.storage.writeFile(path, JSON.stringify(settings, null, 2));
  };
}
