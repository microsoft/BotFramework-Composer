// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { UnsupportedField } from '../UnsupportedField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<UnsupportedField {...props} />);
}

describe('<UnsupportedField />', () => {
  it('renders a label', () => {
    const { container } = renderSubject({ label: 'My Field' });
    expect(container).toHaveTextContent(/My Field \(Unsupported Field\)/);
  });

  it('can toggle details', () => {
    const { getByText, getByTestId } = renderSubject();
    expect(getByTestId('UnsupportedFieldDetails')).not.toBeVisible();
    fireEvent.click(getByText('Toggle Details'));
    expect(getByTestId('UnsupportedFieldDetails')).toBeVisible();
  });
});
