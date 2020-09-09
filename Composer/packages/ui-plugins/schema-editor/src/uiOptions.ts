// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/editor-extension';
import startCase from 'lodash/startCase';

import { CollapsedField } from './Fields/CollapsedField';
import { ValueRefField } from './Fields/ValueRefField';

const objectSerializer = {
  get: (value) => value,
  set: (value) =>
    Object.entries(value || {}).reduce((acc, [key, entry]) => {
      return { ...acc, [key]: { ...(typeof entry === 'object' ? entry : {}), title: startCase(key) } };
    }, {}),
};

export const uiOptions: UIOptions = {
  label: false,
  field: CollapsedField,
  properties: {
    dialogValue: {
      serializer: objectSerializer,
      properties: {
        additionalProperties: {
          hidden: ['title'],
          order: ['type', 'description', '*'],
          serializer: {
            get: ({ $ref, ...rest }: any = {}) => ($ref ? { ...rest, type: $ref } : rest),
            set: ({ type, ...rest }: any = {}) => (type ? { ...rest, $ref: type } : rest),
          },
          properties: {
            type: {
              field: ValueRefField,
            },
          },
        },
      },
    },
    resultValue: {
      serializer: objectSerializer,
      properties: {
        additionalProperties: {
          hidden: ['title'],
          order: ['type', 'description', '*'],
        },
      },
    },
  },
};
