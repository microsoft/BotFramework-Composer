// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds, SDKRoles } from '@bfc/shared';

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
});
