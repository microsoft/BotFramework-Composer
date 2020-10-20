// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { NumberField } from '../NumberField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps({ label: 'number field' }), overrides);
  return render(<NumberField {...props} />);
}

describe('<NumberField />', () => {
  it('correctly sets the value', async () => {
    const onChange = jest.fn();
    const { container } = renderSubject({ onChange, value: 0 });
    const input = container.querySelector('input');

    expect(input).toHaveValue('0');
  });

  it('has an aria-label fallback', () => {
    const { getByLabelText } = renderSubject({ label: false });
    expect(getByLabelText('string field')).toBeInTheDocument();
  });
});
