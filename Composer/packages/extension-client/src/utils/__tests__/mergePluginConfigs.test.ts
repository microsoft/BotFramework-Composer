// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { PluginConfig } from '../../types';
import { mergePluginConfigs } from '../mergePluginConfigs';

describe('mergePluginConfigs', () => {
  it('merges plugin configs into a single object', () => {
    const plugins: Partial<PluginConfig>[] = [
      {
        uiSchema: {
          [SDKKinds.AdaptiveDialog]: {
            form: {
              hidden: ['recognizer'],
              properties: {
                triggers: {
                  label: 'Foo',
                },
              },
            },
          },
        },
      },
      {
        uiSchema: {
          [SDKKinds.SendActivity]: {
            form: {
              label: 'My SendActivity Label',
            },
          },
        },
      },
    ];

    expect(mergePluginConfigs(...plugins).uiSchema).toEqual({
      [SDKKinds.AdaptiveDialog]: {
        form: {
          hidden: ['recognizer'],
          properties: {
            triggers: {
              label: 'Foo',
            },
          },
        },
      },
      [SDKKinds.SendActivity]: {
        form: {
          label: 'My SendActivity Label',
        },
      },
    });
  });

  it('merges recognizers into single list', () => {
    const plugins: Partial<PluginConfig>[] = [
      {
        recognizers: [
          {
            id: 'default',
            displayName: 'Default',
            isSelected: () => false,
            handleRecognizerChange: jest.fn(),
          },
          {
            id: 'new',
            displayName: 'New Recognizer',
            isSelected: () => false,
            handleRecognizerChange: jest.fn(),
          },
        ],
      },
    ];

    expect(mergePluginConfigs(...plugins).recognizers).toHaveLength(2);
  });
});
