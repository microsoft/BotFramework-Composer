// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';

import { StringField } from '../StringField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  return render(<StringField {...fieldProps({ id: 'string field', label: 'a label', ...overrides })} />);
}

describe('<StringField />', () => {
  it('renders a label and description', () => {
    const { getByLabelText } = renderSubject();
    expect(getByLabelText('a label')).toBeInTheDocument();
  });

  it('can change the value', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderSubject({ onChange });
    fireEvent.change(getByLabelText('a label'), { target: { value: 'new value' } });
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('invokes onFocus and onBlur', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    const { getByLabelText } = renderSubject({ onFocus, onBlur, value: 'string value' });

    const input = getByLabelText('a label');

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledWith('string field', 'string value', expect.any(Object));

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledWith('string field', 'string value');
  });

  it('uses a fallback aria label', () => {
    const { container } = renderSubject({ label: '' });
    expect(container.querySelector('[aria-label="string field"]')).toBeInTheDocument();
  });
});
