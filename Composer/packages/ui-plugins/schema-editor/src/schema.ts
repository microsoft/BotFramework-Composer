// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/extension';
import formatMessage from 'format-message';

export const schema = (): JSONSchema7 => ({
  title: formatMessage('Dialog Interface'),
  type: 'object',
  properties: {
    dialogValue: {
      type: 'object',
      title: formatMessage('Input'),
      description: formatMessage('Dialog input schema.'),
      additionalProperties: {
        $ref: '#/definitions/dialogProperties',
      },
    },
    resultValue: {
      type: 'object',
      title: formatMessage('Output'),
      description: formatMessage('Dialog output schema.'),
      additionalProperties: {
        $ref: '#/definitions/dialogProperties',
      },
    },
  },
  definitions: {
    dialogProperties: {
      type: 'object',
      required: ['ref', 'type'],
      properties: {
        title: {
          type: 'string',
          title: formatMessage('Title'),
          description: formatMessage('Property title'),
        },
        description: {
          type: 'string',
          title: formatMessage('Description'),
          description: formatMessage('Property description.'),
        },
        type: {
          type: 'string',
          title: formatMessage('Type'),
          description: formatMessage('Property type.'),
          enum: ['array', 'boolean', 'integer', 'number', 'object', 'string'],
        },
      },
    },
  },
});

export const valueTypeDefinitions: { [key: string]: JSONSchema7 } = {
  expression: {
    $role: 'expression',
    type: 'string',
    title: 'Expression',
    description: 'Expression to evaluate.',
    pattern: '^.*\\S.*',
    examples: ['user.age > 13'],
  },
  equalsExpression: {
    $role: 'expression',
    type: 'string',
    title: 'Equals Expression',
    description: 'Expression starting with =.',
    pattern: '^=.*\\S.*',
    examples: ['=user.name'],
  },
  condition: {
    $role: 'expression',
    title: 'Boolean condition',
    description: 'Boolean constant or expression to evaluate.',
    oneOf: [
      {
        $ref: '#/definitions/expression',
      },
      {
        type: 'boolean',
        title: 'Boolean',
        description: 'Boolean value.',
        default: true,
        examples: [false],
      },
    ],
  },
  booleanExpression: {
    $role: 'expression',
    title: 'Boolean or expression',
    description: 'Boolean constant or expression to evaluate.',
    oneOf: [
      {
        type: 'boolean',
        title: 'Boolean',
        description: 'Boolean constant.',
        default: false,
        examples: [false],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ['=user.isVip'],
      },
    ],
  },
  numberExpression: {
    $role: 'expression',
    title: 'Number or expression',
    description: 'Number constant or expression to evaluate.',
    oneOf: [
      {
        type: 'number',
        title: 'Number',
        description: 'Number constant.',
        default: 0,
        examples: [15.5],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ['=dialog.quantity'],
      },
    ],
  },
  integerExpression: {
    $role: 'expression',
    title: 'Integer or expression',
    description: 'Integer constant or expression to evaluate.',
    oneOf: [
      {
        type: 'integer',
        title: 'Integer',
        description: 'Integer constant.',
        default: 0,
        examples: [15],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ['=user.age'],
      },
    ],
  },
  stringExpression: {
    $role: 'expression',
    title: 'String or expression',
    description: 'Interpolated string or expression to evaluate.',
    oneOf: [
      {
        type: 'string',
        title: 'String',
        description: 'Interpolated string',
        pattern: '^(?!(=)).*',
        examples: ['Hello ${user.name}'],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ["=concat('x','y','z')"],
      },
    ],
  },
  arrayExpression: {
    $role: 'expression',
    title: 'Array or expression',
    description: 'Array or expression to evaluate.',
    oneOf: [
      {
        type: 'array',
        title: 'Array',
        description: 'Array constant.',
      },
      {
        $ref: '#/definitions/equalsExpression',
      },
    ],
  },
  objectExpression: {
    $role: 'expression',
    title: 'Object or expression',
    description: 'Object or expression to evaluate.',
    oneOf: [
      {
        type: 'object',
        title: 'Object',
        description: 'Object constant.',
      },
      {
        $ref: '#/definitions/equalsExpression',
      },
    ],
  },
  valueExpression: {
    $role: 'expression',
    title: 'Any or expression',
    description: 'Any constant or expression to evaluate.',
    oneOf: [
      {
        type: 'object',
        title: 'Object',
        description: 'Object constant.',
      },
      {
        type: 'array',
        title: 'Array',
        description: 'Array constant.',
      },
      {
        type: 'string',
        title: 'String',
        description: 'Interpolated string.',
        pattern: '^(?!(=)).*',
        examples: ['Hello ${user.name}'],
      },
      {
        type: 'boolean',
        title: 'Boolean',
        description: 'Boolean constant',
        examples: [false],
      },
      {
        type: 'number',
        title: 'Number',
        description: 'Number constant.',
        examples: [15.5],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ['=...'],
      },
    ],
  },
};
