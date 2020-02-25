// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as DefaultFields from '../../components/fields';
import { resolveFieldWidget } from '../resolveFieldWidget';

const TestField = () => 'test field';

describe('resolveFieldWidget', () => {
  describe('field', () => {
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
    it('uses global overrides', () => {
      const schema = {
        type: 'string' as const,
        $role: 'expression',
      };

      const globalSchema = {
        roleSchema: {
          expression: {
            field: DefaultFields.StringField,
          },
        },
        uiSchema: {},
        recognizers: [],
      };

      expect(resolveFieldWidget(schema, {}, globalSchema)).toEqual(DefaultFields.StringField);
    });
  });

  describe('schema.$kind', () => {
    it('uses global overrides', () => {
      const schema = {
        type: 'string' as const,
        $kind: 'Microsoft.Recognizer',
      };

      const globalSchema = {
        roleSchema: {},
        uiSchema: {
          'Microsoft.Recognizer': {
            field: DefaultFields.RecognizerField,
          },
        },
        recognizers: [],
      };

      expect(resolveFieldWidget(schema, {}, globalSchema)).toEqual(DefaultFields.RecognizerField);
    });
  });

  describe('type: string', () => {
    it('returns StringField', () => {
      const schema = {
        type: 'string' as const,
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.StringField);
    });

    it('returns SelectField with an enum', () => {
      const schema = {
        type: 'string' as const,
        enum: ['one', 'two', 'three'],
      };

      expect(resolveFieldWidget(schema)).toEqual(DefaultFields.SelectField);
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
});
