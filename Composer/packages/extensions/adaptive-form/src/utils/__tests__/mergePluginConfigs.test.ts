// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds, SDKRoles } from '@bfc/shared';
import { PluginConfig } from '@bfc/extension';

import { mergePluginConfigs } from '../mergePluginConfigs';
import DefaultUISchema from '../../defaultUiSchema';
import DefaultRoleSchema from '../../defaultRoleSchema';
import DefaultRecognizers from '../../defaultRecognizers';

describe('mergePluginConfigs', () => {
  it('returns default ui schema when no overrides', () => {
    expect(mergePluginConfigs()).toEqual({
      formSchema: DefaultUISchema,
      roleSchema: DefaultRoleSchema,
      recognizers: DefaultRecognizers,
    });
  });

  it('merges overrides into the defaults', () => {
    const overrides = {
      formSchema: {
        [SDKKinds.AdaptiveDialog]: {
          hidden: ['recognizer'],
          properties: {
            triggers: {
              label: 'Foo',
            },
          },
        },
      },
      roleSchema: {
        [SDKRoles.expression]: {
          label: 'expression label',
        },
      },
    };

    expect(mergePluginConfigs(overrides)).toMatchObject({
      formSchema: {
        [SDKKinds.AdaptiveDialog]: {
          ...DefaultUISchema[SDKKinds.AdaptiveDialog],
          hidden: ['recognizer'],
          properties: {
            ...DefaultUISchema[SDKKinds.AdaptiveDialog]?.properties,
            triggers: {
              label: 'Foo',
            },
          },
        },
      },
      roleSchema: {
        [SDKRoles.expression]: {
          label: 'expression label',
        },
      },
    });
  });

  it('merges recognizers into default recognizer list', () => {
    expect(mergePluginConfigs({}).recognizers).toHaveLength(2);

    const overrides: Partial<PluginConfig> = {
      recognizers: [
        {
          id: 'new',
          displayName: 'New Recognizer',
          isSelected: () => false,
          handleRecognizerChange: jest.fn(),
        },
      ],
    };

    expect(mergePluginConfigs(overrides).recognizers).toHaveLength(3);
  });
});
