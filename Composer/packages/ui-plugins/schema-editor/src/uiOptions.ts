// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension';

import { ValueField } from './ValueField';

const serializer = {
  get: ({ $ref, ...rest }: any = {}) => ($ref ? { ...rest, ref: $ref } : rest),
  set: ({ ref, ...rest }: any = {}) => (ref ? { ...rest, $ref: ref } : rest),
};

export const uiOptions: UIOptions = {
  label: false,
  properties: {
    dialogValue: {
      properties: {
        additionalProperties: {
          serializer,
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
        additionalProperties: {
          serializer,
        },
      },
    },
  },
};
