// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getOptions, getSelectedOption } from '../utils';

function makeOption(schema, type) {
  return {
    key: type,
    text: type,
    data: { schema: { ...schema, type } },
  };
}

describe('getOptions', () => {
  describe('when there is an array of types', () => {
    const schema = {
      title: 'test schema',
      type: ['string' as const, 'boolean' as const, 'number' as const],
    };

    it('returns all of the types, sorted', () => {
      expect(getOptions(schema, {})).toEqual([
        makeOption(schema, 'boolean'),
        makeOption(schema, 'number'),
        makeOption(schema, 'string'),
      ]);
    });
  });

  describe('when there is a oneOf property', () => {
    const schema = {
      title: 'Test Schema',
      oneOf: [
        {
          type: 'string' as const,
          title: 'My Awesome String',
        },
        {
          type: 'boolean' as const,
        },
        {
          type: 'number' as const,
        },
        {
          title: 'an enum',
          enum: ['one', 'two'],
        },
        {
          enum: ['four', 'five'],
        },
        {
          $ref: '#/definitions/Microsoft.AnotherType',
        },
      ],
    };

    const definitions = {
      'Microsoft.AnotherType': {
        title: 'Another Type',
        type: 'object' as const,
      },
    };

    it('returns one of options', () => {
      const options = getOptions(schema, definitions).map(o => o.key);
      expect(options).toEqual(['my awesome string', 'boolean', 'number', 'an enum', 'dropdown', 'another type']);
    });
  });
});

describe('getSelectedOption', () => {
  const options = [
    {
      key: 'string',
      text: 'string',
      data: {
        schema: {
          type: 'string',
        },
      },
    },
    {
      key: 'integer',
      text: 'integer',
      data: {
        schema: {
          type: 'integer',
        },
      },
    },
    {
      key: 'object',
      text: 'object',
      data: {
        schema: {
          type: 'object',
        },
      },
    },
    {
      key: 'array1',
      text: 'array1',
      data: {
        schema: {
          type: 'array',
        },
      },
    },
    {
      key: 'array2',
      text: 'array2',
      data: {
        schema: {
          type: 'array',
          items: {
            type: 'integer',
          },
        },
      },
    },
  ];

  it('returns undefined if there are no options', () => {
    expect(getSelectedOption(123, [])).toBe(undefined);
  });

  it('returns the first option if the value is null or undefined', () => {
    expect(getSelectedOption(undefined, options)).toEqual(options[0]);
    expect(getSelectedOption(null, options)).toEqual(options[0]);
  });

  it('returns the option that matches the value type', () => {
    expect(getSelectedOption('foo', options)).toEqual(options[0]);
    expect(getSelectedOption(123, options)).toEqual(options[1]);
    expect(getSelectedOption({ foo: 'bar' }, options)).toEqual(options[2]);
  });

  it("returns the first option if it can't find a match", () => {
    expect(getSelectedOption(true, options)).toEqual(options[0]);
  });

  describe('when the value is an array', () => {
    it('returns the first array type if there are no array items', () => {
      expect(getSelectedOption([], options)).toEqual(options[3]);
    });

    it('returns the option that matches the first item type', () => {
      expect(getSelectedOption([123], options)).toEqual(options[4]);
    });

    it('returns the first option if no type match found', () => {
      expect(getSelectedOption(['foo'], options)).toEqual(options[3]);
    });
  });
});
