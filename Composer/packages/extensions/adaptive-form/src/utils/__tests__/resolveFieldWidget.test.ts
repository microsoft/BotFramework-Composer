// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as DefaultFields from '../../components/fields';
import { resolveFieldWidget } from '../resolveFieldWidget';

const TestField = () => 'test field';

describe('resolveFieldWidget', () => {
  describe('ui option field', () => {
    it('returns field override if present', () => {
      const uiOptions = {
        field: TestField,
      };

      const schema = {
        type: 'string' as const,
      };

      // @ts-ignore
      expect(resolveFieldWidget(schema, uiOptions)).toEqual(TestField);
    });
  });

  describe('schema.$role', () => {
    describe('$role: expression', () => {
      it('returns ExpressionField', () => {
        const schema = {
          type: 'string' as const,
          $role: 'expression',
        };

        expect(resolveFieldWidget(schema, {})).toEqual(DefaultFields.ExpressionField);
      });
    });
  });

  describe('schema.$kind', () => {
    it('uses global overrides', () => {
      const schema = {
        type: 'string' as const,
        $kind: 'Microsoft.IRecognizer',
      };

      const globalSchema = {
        'Microsoft.IRecognizer': {
          field: DefaultFields.RecognizerField,
        },
      };

      expect(resolveFieldWidget(schema, {}, globalSchema)).toEqual(DefaultFields.RecognizerField);
    });
  });

  describe('schema: oneOf', () => {
    it('returns OneOfField', () => {
      const schema = {
        oneOf: [
          {
            type: 'number' as const,
          },
          {
            type: 'string' as const,
          },
        ],
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.OneOfField);
    });
  });

  describe('type: undefined', () => {
    it('defaults to StringField', () => {
      const schema = {
        title: 'undefined',
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.StringField);
    });
  });

  describe('type: any[]', () => {
    it('returns OneOfField', () => {
      const schema = {
        type: ['string' as const, 'number' as const, 'boolean' as const],
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.OneOfField);
    });
  });

  describe('type: enum', () => {
    it('returns SelectField with an enum', () => {
      const schema = {
        enum: ['one', 'two', 'three'],
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.SelectField);
    });
  });

  describe('type: string', () => {
    it('returns StringField', () => {
      const schema = {
        type: 'string' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.StringField);
    });
  });

  describe('type: integer', () => {
    it('returns NumberField', () => {
      const schema = {
        type: 'integer' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.NumberField);
    });
  });

  describe('type: number', () => {
    it('returns NumberField', () => {
      const schema = {
        type: 'number' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.NumberField);
    });
  });

  describe('type: boolean', () => {
    it('returns BooleanField', () => {
      const schema = {
        type: 'boolean' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.BooleanField);
    });
  });

  describe('type: array', () => {
    it('returns ArrayField', () => {
      const schema = {
        type: 'array' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.ArrayField);
    });

    it('returns ObjectArrayField when item type is object', () => {
      const schema = {
        type: 'array' as const,
        items: {
          type: 'object' as const,
        },
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.ObjectArrayField);
    });

    it('can handle different items schemas', () => {
      const stringArray = {
        type: 'array' as const,
        items: [
          {
            type: 'string' as const,
          },
        ],
      };

      expect(resolveFieldWidget(stringArray)).toEqual(DefaultFields.ArrayField);

      const objectArray = {
        type: 'array' as const,
        items: [
          {
            type: 'object' as const,
          },
        ],
      };

      expect(resolveFieldWidget(objectArray)).toEqual(DefaultFields.ObjectArrayField);
    });
  });

  describe('type: object', () => {
    it('returns ObjectField by default', () => {
      const schema = {
        type: 'object' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.ObjectField);
    });

    it('returns OpenObjectField when additional properties are allowed', () => {
      const schema = {
        type: 'object' as const,
        additionalProperties: true,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.OpenObjectField);
    });
  });

  describe('unknown schema', () => {
    it('returns UnsupportedField', () => {
      expect(resolveFieldWidget()).toEqual(DefaultFields.UnsupportedField);
    });
  });
});
