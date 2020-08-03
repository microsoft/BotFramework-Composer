// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension';
import startCase from 'lodash/startCase';

import { CollapsedField } from './CollapsedField';
import { ResultRefField, ValueRefField } from './RefFields';

const propertySerializer = {
  get: ({ $ref, ...rest }: any = {}) => ($ref ? { ...rest, ref: $ref } : rest),
  set: ({ ref, ...rest }: any = {}) => (ref ? { ...rest, $ref: ref } : rest),
};

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
          order: ['ref', 'description', '*'],
          serializer: propertySerializer,
          properties: {
            ref: {
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
          order: ['ref', 'description', '*'],
          serializer: propertySerializer,
          properties: {
            ref: {
              field: ResultRefField,
            },
          },
        },
      },
    },
  },
};
