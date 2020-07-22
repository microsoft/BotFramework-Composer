// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension';

import { ValueField } from './ValueField';

export const uiOptions: UIOptions = {
  label: false,
  serializer: {
    get: (value) => ({
      dialogValue: Object.entries(value.dialogValue || {}).map(([property, value]) => ({ property, value })),
      resultValue: Object.entries(value.resultValue || {}).map(([property, value]) => ({ property, value })),
    }),
    set: (value) => ({
      dialogValue: (value.dialogValue || []).reduce(
        (acc, { property = '', value = {} }) => ({ ...acc, [property]: value }),
        {}
      ),
      resultValue: (value.resultValue || []).reduce(
        (acc, { property = '', value = {} }) => ({ ...acc, [property]: value }),
        {}
      ),
    }),
  },
  properties: {
    dialogValue: {
      properties: {
        value: {
          serializer: {
            get: ({ $ref, ...rest } = {}) => ($ref ? { ...rest, ref: $ref } : rest),
            set: ({ ref, ...rest } = {}) => (ref ? { ...rest, $ref: ref } : rest),
          },
          properties: {
            ref: {
              field: ValueField,
            },
          },
        },
      },
    },
    resultValue: {
      properties: {
        value: {
          serializer: {
            get: ({ $ref, ...rest } = {}) => ($ref ? { ...rest, ref: $ref } : rest),
            set: ({ ref, ...rest } = {}) => (ref ? { ...rest, $ref: ref } : rest),
          },
          properties: {
            ref: {
              field: ValueField,
            },
          },
        },
      },
    },
  },
};
