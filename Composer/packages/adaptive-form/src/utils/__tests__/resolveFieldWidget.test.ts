// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as DefaultFields from '../../components/fields';
import { resolveFieldWidget } from '../resolveFieldWidget';

const TestField = () => 'test field';

describe('resolveFieldWidget', () => {
  describe('uiOption field', () => {
    it('returns field override if present', () => {
      const uiOptions = {
        field: TestField,
      };

      const schema = {
        type: 'string' as const,
      };

      // @ts-ignore
      const { field: ReturnedField } = resolveFieldWidget({ schema, uiOptions });
      expect(ReturnedField).toEqual(TestField);
    });
  });

  describe('$role: expression', () => {
    it('returns ExpressionField', () => {
      const schema = {
        type: 'string' as const,
        $role: 'expression',
      };
      const { field: ReturnedField } = resolveFieldWidget({ schema });
      expect(ReturnedField).toEqual(DefaultFields.ExpressionField);
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
      const { field: ReturnedField } = resolveFieldWidget({ schema, globalUIOptions: globalSchema });
      expect(ReturnedField).toEqual(DefaultFields.RecognizerField);
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

      const { field: ReturnedField } = resolveFieldWidget({ schema });
      expect(ReturnedField).toEqual(DefaultFields.OneOfField);
    });
  });

  describe('type: undefined', () => {
    it('defaults to StringField', () => {
      const schema = {
        title: 'undefined',
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.StringField);
    });
  });

  describe('type: any[]', () => {
    it('returns OneOfField', () => {
      const schema = {
        type: ['string' as const, 'number' as const, 'boolean' as const],
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema });
      expect(ReturnedField).toEqual(DefaultFields.OneOfField);
    });
  });

  describe('type: enum', () => {
    it('returns SelectField with an enum', () => {
      const schema = {
        enum: ['one', 'two', 'three'],
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });
      expect(ReturnedField).toEqual(DefaultFields.SelectField);
    });
  });

  describe('type: string', () => {
    it('returns StringField', () => {
      const schema = {
        type: 'string' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.StringField);
    });
  });

  describe('type: integer', () => {
    it('returns NumberField', () => {
      const schema = {
        type: 'integer' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.NumberField);
    });
  });

  describe('type: number', () => {
    it('returns NumberField', () => {
      const schema = {
        type: 'number' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.NumberField);
    });
  });

  describe('type: boolean', () => {
    it('returns BooleanField', () => {
      const schema = {
        type: 'boolean' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.BooleanField);
    });
  });

  describe('type: array', () => {
    it('returns ArrayField', () => {
      const schema = {
        type: 'array' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.JsonField);
    });

    it('returns ObjectArrayField when item type is object', () => {
      const schema = {
        type: 'array' as const,
        items: {
          type: 'object' as const,
        },
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema });
      expect(ReturnedField).toEqual(DefaultFields.ObjectArrayField);
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

      const { field: ReturnedField1 } = resolveFieldWidget({ schema: stringArray });
      expect(ReturnedField1).toEqual(DefaultFields.ArrayField);

      const objectArray = {
        type: 'array' as const,
        items: [
          {
            type: 'object' as const,
          },
        ],
      };

      const { field: ReturnedField2 } = resolveFieldWidget({ schema: objectArray });
      expect(ReturnedField2).toEqual(DefaultFields.ObjectArrayField);
    });
  });

  describe('type: object', () => {
    it('returns ObjectField by default', () => {
      const schema = {
        type: 'object' as const,
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema, isOneOf: true });

      expect(ReturnedField).toEqual(DefaultFields.JsonField);
    });

    it('returns OpenObjectField when additional properties are allowed', () => {
      const schema = {
        type: 'object' as const,
        additionalProperties: {
          type: 'string',
          title: '',
          description: '',
        },
      };

      const { field: ReturnedField } = resolveFieldWidget({ schema });
      expect(ReturnedField).toEqual(DefaultFields.OpenObjectField);
    });
  });

  describe('unknown schema', () => {
    it('returns UnsupportedField', () => {
      const { field: ReturnedField } = resolveFieldWidget({});
      expect(ReturnedField).toEqual(DefaultFields.UnsupportedField);
    });
  });
});
