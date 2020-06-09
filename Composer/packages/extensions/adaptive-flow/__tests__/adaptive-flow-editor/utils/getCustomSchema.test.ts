// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OBISchema } from '@bfc/shared';

import { getCustomSchema } from '../../../src/adaptive-flow-editor/utils/getCustomSchema';

describe('getCustomSchema', () => {
  it('can handle invalid input', () => {
    expect(getCustomSchema()).toBeUndefined();
    expect(getCustomSchema({}, undefined)).toBeUndefined();
    expect(getCustomSchema(undefined, undefined)).toBeUndefined();

    expect(getCustomSchema({}, {})).toBeUndefined();
  });

  it('can genreate diff schema', () => {
    const ejected = {
      definitions: {
        'Microsoft.SendActivity': {
          title: 'SendActivity Title',
          description: 'Send an activity.',
        },
      },
    } as OBISchema;
    expect(getCustomSchema({ oneOf: [], definitions: {} }, ejected)).toEqual({
      oneOf: [
        {
          title: 'SendActivity Title',
          description: 'Send an activity.',
          $ref: '#/definitions/Microsoft.SendActivity',
        },
      ],
      definitions: {
        'Microsoft.SendActivity': ejected.definitions['Microsoft.SendActivity'],
      },
    });
  });
});
