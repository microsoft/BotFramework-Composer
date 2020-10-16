// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { BooleanField } from '../BooleanField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<BooleanField {...props} />);
}

describe('<BooleanField />', () => {
  it('renders a dropdown with true / false', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText } = renderSubject({ label: 'boolean field', onChange, value: false });

    const dropdown = getByLabelText('boolean field');
    expect(dropdown).toHaveTextContent('false');

    fireEvent.click(dropdown);
    fireEvent.click(getByText('true'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('has a fallback aria label', () => {
    const { container } = renderSubject();
    expect(container.querySelector('[aria-label="boolean field"]')).toBeInTheDocument();
  });
});
