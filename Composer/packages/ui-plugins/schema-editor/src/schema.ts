// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/extension-client';
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
  equalsExpression: {
    $role: 'expression',
    type: 'string',
    title: formatMessage('Equals Expression'),
    description: formatMessage('Expression starting with =.'),
    pattern: '^=.*\\S.*',
    examples: ['=user.name'],
  },
  booleanExpression: {
    $role: 'expression',
    title: formatMessage('Boolean'),
    description: formatMessage('Boolean constant or expression to evaluate.'),
    oneOf: [
      {
        type: 'boolean',
        title: formatMessage('Boolean'),
        description: formatMessage('Boolean constant.'),
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
    title: formatMessage('Number'),
    description: formatMessage('Number constant or expression to evaluate.'),
    oneOf: [
      {
        type: 'number',
        title: formatMessage('Number'),
        description: formatMessage('Number constant.'),
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
    title: formatMessage('Integer'),
    description: formatMessage('Integer constant or expression to evaluate.'),
    oneOf: [
      {
        type: 'integer',
        title: formatMessage('Integer'),
        description: formatMessage('Integer constant.'),
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
    title: formatMessage('String'),
    description: formatMessage('Interpolated string or expression to evaluate.'),
    oneOf: [
      {
        type: 'string',
        title: formatMessage('String'),
        description: formatMessage('Interpolated string'),
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
    title: formatMessage('Array'),
    description: formatMessage('Array or expression to evaluate.'),
    oneOf: [
      {
        type: 'array',
        title: formatMessage('Array'),
        description: formatMessage('Array constant.'),
      },
      {
        $ref: '#/definitions/equalsExpression',
      },
    ],
  },
  objectExpression: {
    $role: 'expression',
    title: formatMessage('Object'),
    description: formatMessage('Object or expression to evaluate.'),
    oneOf: [
      {
        type: 'object',
        title: formatMessage('Object'),
        description: formatMessage('Object constant.'),
      },
      {
        $ref: '#/definitions/equalsExpression',
      },
    ],
  },
  valueExpression: {
    $role: 'expression',
    title: formatMessage('Any'),
    description: formatMessage('Any constant or expression to evaluate.'),
    oneOf: [
      {
        type: 'object',
        title: formatMessage('Object'),
        description: formatMessage('Object constant.'),
      },
      {
        type: 'array',
        title: formatMessage('Array'),
        description: formatMessage('Array constant.'),
      },
      {
        type: 'string',
        title: formatMessage('String'),
        description: formatMessage('Interpolated string.'),
        pattern: '^(?!(=)).*',
        examples: ['Hello ${user.name}'],
      },
      {
        type: 'boolean',
        title: formatMessage('Boolean'),
        description: formatMessage('Boolean constant'),
        examples: [false],
      },
      {
        type: 'number',
        title: formatMessage('Number'),
        description: formatMessage('Number constant.'),
        examples: [15.5],
      },
      {
        $ref: '#/definitions/equalsExpression',
        examples: ['=...'],
      },
    ],
  },
};
