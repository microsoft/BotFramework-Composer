// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension';

import { RefField } from './RefField';

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
              field: RefField,
            },
          },
        },
      },
    },
    resultValue: {
      properties: {
        additionalProperties: {
          serializer,
          properties: {
            ref: {
              field: RefField,
            },
          },
        },
      },
    },
  },
};
