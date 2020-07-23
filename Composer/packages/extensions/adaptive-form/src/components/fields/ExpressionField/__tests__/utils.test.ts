// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getOptions, getSelectedOption, getOneOfOptions } from '../utils';

describe('getOneOfOptions', () => {
  const schema = {
    title: 'test schema',
    oneOf: [
      {
        type: 'array' as const,
        oneOf: [
          {
            items: {
              type: 'string' as const,
            },
          },
          {
            items: {
              type: 'object' as const,
            },
          },
        ],
      },
      {
        type: 'string' as const,
      },
    ],
  };

  it('returns options of each one of entry', () => {
    const options = getOneOfOptions(schema.oneOf, schema, {}).map((o) => o.key);
    expect(options).toEqual(['array (string)', 'array (object)', 'string']);
  });
});

describe('getOptions', () => {
  describe('when there is an array of types', () => {
    describe('when there are more than 2 types', () => {
      const schema = {
        title: 'test schema',
        type: ['string' as const, 'boolean' as const, 'number' as const],
      };

      it('returns the types and expression', () => {
        const options = getOptions(schema, {}).map((o) => o.key);
        expect(options).toEqual(['boolean', 'expression', 'number', 'string']);
      });
    });

    describe('when there is only 2 options', () => {
      const schema = {
        title: 'test schema',
        type: ['boolean' as const, 'number' as const],
      };

      it('returns the types without expression', () => {
        const options = getOptions(schema, {}).map((o) => o.key);
        expect(options).toEqual(['boolean', 'number']);
      });
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
      const options = getOptions(schema, definitions).map((o) => o.key);
      expect(options).toEqual(['my awesome string', 'boolean', 'number', 'an enum', 'dropdown', 'another type']);
    });
  });

  describe('when there are enum options', () => {
    const schema = {
      title: 'Test Schema',
      type: 'string' as const,
      enum: ['one', 'two', 'three'],
    };

    it('returns dropdown and expression options', () => {
      const options = getOptions(schema, {}).map((o) => o.key);
      expect(options).toEqual(['dropdown', 'expression']);
    });
  });

  it('returns expression option by default', () => {
    const options = getOptions({}, {}).map((o) => o.key);
    expect(options).toEqual(['expression']);
  });
});

describe('getSelectedOption', () => {
  const options = [
    {
      key: 'string',
      text: 'string',
      data: {
        schema: {
          type: 'string' as const,
        },
      },
    },
    {
      key: 'number',
      text: 'number',
      data: {
        schema: {
          type: 'number' as const,
        },
      },
    },
    {
      key: 'object',
      text: 'object',
      data: {
        schema: {
          type: 'object' as const,
        },
      },
    },
    {
      key: 'array1',
      text: 'array1',
      data: {
        schema: {
          type: 'array' as const,
        },
      },
    },
    {
      key: 'array2',
      text: 'array2',
      data: {
        schema: {
          type: 'array' as const,
          items: {
            type: 'integer' as const,
          },
        },
      },
    },
    {
      key: 'expression',
      text: 'expression',
      data: {
        schema: { type: 'string' as const },
      },
    },
  ];

  it('returns undefined if there are no options', () => {
    expect(getSelectedOption(123, [])).toBe(undefined);
  });

  describe('when the value is undefined', () => {
    describe('when there are more than 2 options', () => {
      it('returns the expression option', () => {
        expect(getSelectedOption(undefined, options)).toEqual(options[5]);
        expect(getSelectedOption(null, options)).toEqual(options[5]);
      });
    });

    describe('when there are 2 or less options', () => {
      it('returns the first option', () => {
        expect(getSelectedOption(undefined, options.slice(0, 2))).toEqual(options[0]);
        expect(getSelectedOption(null, options.slice(0, 2))).toEqual(options[0]);
      });
    });
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
