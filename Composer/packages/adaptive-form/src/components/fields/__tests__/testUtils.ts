// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assign from 'lodash/assign';
import { FieldProps } from '@bfc/extension-client';

const defaults: FieldProps = {
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
