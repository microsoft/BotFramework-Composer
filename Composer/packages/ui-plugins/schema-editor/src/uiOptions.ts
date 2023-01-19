// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension-client';
import formatMessage from 'format-message';
import startCase from 'lodash/startCase';

const objectSerializer = {
  get: (value) => value,
  set: (value) =>
    Object.entries(value || {}).reduce((acc, [key, entry]) => {
      return { ...acc, [key]: { ...(typeof entry === 'object' ? entry : {}), title: startCase(key) } };
    }, {}),
};

export const uiOptions: UIOptions = {
  label: false,
  fieldsets: [{ title: formatMessage('Dialog Interface') }],
  properties: {
    dialogValue: {
      serializer: objectSerializer,
      properties: {
        additionalProperties: {
          hidden: ['title'],
          order: ['type', 'description', '*'],
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
