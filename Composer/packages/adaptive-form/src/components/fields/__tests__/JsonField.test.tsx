// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { JsonField } from '../JsonField';

import { fieldProps } from './testUtils';

jest.mock('@bfc/extension', () => ({
  useShellApi: () => ({
    userSettings: {},
  }),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<JsonField {...props} />);
}

describe('<JsonField />', () => {
  it('renders a json editor', () => {
    const { getByTestId } = renderSubject();
    expect(getByTestId('JsonFieldEditor')).toBeInTheDocument();
  });
});
