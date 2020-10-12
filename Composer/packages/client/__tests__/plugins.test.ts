// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { mergePluginConfigs } from '../src/plugins';

describe('mergePluginConfigs', () => {
  it('merges plugin configs from left to right', () => {
    const config1 = {
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            label: 'default label',
          },
        },
      },
    };
    const config2 = {
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            description: 'new description',
          },
        },
      },
    };
    const config3 = {
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            label: 'label override',
          },
        },
      },
    };

    const result = mergePluginConfigs(config1, config2, config3);
    expect(result).toEqual({
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            label: 'label override',
            description: 'new description',
          },
        },
      },
      widgets: {},
    });
  });

  it('adds recognizers', () => {
    const config1 = {
      uiSchema: {
        [SDKKinds.RegexRecognizer]: {
          recognizer: { displayName: 'recognizer1' },
        },
      },
    };

    const config2 = {
      uiSchema: {
        [SDKKinds.LuisRecognizer]: {
          recognizer: { displayName: 'recognizer2' },
        },
      },
    };

    expect(mergePluginConfigs(config1, config2).uiSchema).toEqual({
      [SDKKinds.RegexRecognizer]: {
        recognizer: { displayName: 'recognizer1' },
      },
      [SDKKinds.LuisRecognizer]: {
        recognizer: { displayName: 'recognizer2' },
      },
    });
  });

  it('replaces other arrays', () => {
    const config1 = {
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            order: ['foo', 'bar'],
          },
        },
      },
    };
    const config2 = {
      uiSchema: {
        'Microsoft.SendActivity': {
          form: {
            order: ['baz', '*'],
          },
        },
      },
    };

    expect(mergePluginConfigs(config1, config2).uiSchema).toEqual({
      'Microsoft.SendActivity': {
        form: {
          order: ['baz', '*'],
        },
      },
    });
  });
});
