// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/shared';

import { getCustomSchema } from '../../../src/adaptive-flow-editor/utils/getCustomSchema';

describe('getCustomSchema', () => {
  it('can handle invalid input', () => {
    expect(getCustomSchema()).toEqual({});
    expect(getCustomSchema({}, undefined)).toEqual({});
    expect(getCustomSchema(undefined, undefined)).toEqual({});

    expect(getCustomSchema({}, {})).toEqual({});
  });

  it('can genreate diff action schema', () => {
    const ejected = {
      definitions: {
        'Microsoft.SendActivity': {
          $role: 'implements(Microsoft.IDialog)',
          title: 'SendActivity Title',
          description: 'Send an activity.',
        },
      },
    } as JSONSchema7;
    expect(getCustomSchema({ oneOf: [], definitions: {} }, ejected)).toEqual({
      actions: {
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
      },
    });
  });

  it('can genreate diff synthesized schema', () => {
    const ejected = {
      definitions: {
        'Microsoft.SendActivity': {
          $role: 'implements(Microsoft.IDialog)',
          title: 'SendActivity Title',
          description: 'Send an activity.',
        },
        'Microsoft.MyRecognizer': {
          $role: 'implements(Microsoft.IRecognizer)',
          title: 'My Recognizer Title',
          description: 'My Recognizer.',
        },
        'Microsoft.MyTrigger': {
          $role: 'implements(Microsoft.ITrigger)',
          title: 'My Trigger Title',
          description: 'My Trigger.',
        },
      },
    } as JSONSchema7;
    expect(getCustomSchema({ oneOf: [], definitions: {} }, ejected)).toEqual({
      actions: {
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
      },
      recognizers: {
        oneOf: [
          {
            title: 'My Recognizer Title',
            description: 'My Recognizer.',
            $ref: '#/definitions/Microsoft.MyRecognizer',
          },
        ],
        definitions: {
          'Microsoft.MyRecognizer': ejected.definitions['Microsoft.MyRecognizer'],
        },
      },
      triggers: {
        oneOf: [
          {
            title: 'My Trigger Title',
            description: 'My Trigger.',
            $ref: '#/definitions/Microsoft.MyTrigger',
          },
        ],
        definitions: {
          'Microsoft.MyTrigger': ejected.definitions['Microsoft.MyTrigger'],
        },
      },
    });
  });
});
