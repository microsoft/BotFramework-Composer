// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assign from 'lodash/assign';
import get from 'lodash/get';
import { FieldProps, RecognizerSchema } from '@bfc/extension-client';

const defaults: FieldProps = {
  depth: 0,
  schema: {},
  definitions: {},
  uiOptions: {},
  name: 'testName',
  id: 'testId',
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

export function fieldProps(overrides: Partial<FieldProps> = {}): FieldProps {
  return assign({}, defaults, overrides);
}

export function mockRecognizerConfig(recognizerConfigs: RecognizerSchema[]) {
  return {
    recognizers: recognizerConfigs,
    findRecognizer: (recognizerValue) => {
      recognizerConfigs.find((x) => x.id === get(recognizerValue, '$kind'));
    },
  };
}
