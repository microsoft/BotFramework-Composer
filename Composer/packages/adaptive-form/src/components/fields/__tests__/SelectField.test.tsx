// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { SelectField } from '../SelectField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<SelectField {...props} />);
}

describe('<SelectField />', () => {
  it('renders a label and a dropdown', () => {
    const { getByTestId, getByLabelText } = renderSubject({ label: 'select field' });

    expect(getByLabelText('select field')).toBeInTheDocument();
    expect(getByTestId('SelectFieldDropdown')).toBeInTheDocument();
  });

  it('formats schema options into dropdown options', () => {
    const enumOptions = ['option 1', 'option 2', 'option 3'];
    const { getByTestId } = renderSubject({ enumOptions });

    const dropdown = getByTestId('SelectFieldDropdown');
    fireEvent.click(dropdown);

    // remove the first option because it is the one shown as selected
    const options = screen.getAllByRole('option').slice(1);
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('');
    expect(options[1]).toHaveTextContent(/option 1/);
    expect(options[2]).toHaveTextContent(/option 2/);
    expect(options[3]).toHaveTextContent(/option 3/);
  });

  it('can selected a new value', () => {
    const enumOptions = ['option 1', 'option 2', 'option 3'];
    const onChange = jest.fn();
    const { getByTestId } = renderSubject({ enumOptions, onChange });

    const dropdown = getByTestId('SelectFieldDropdown');
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByRole('option', { name: 'option 2' }));
    expect(onChange).toHaveBeenCalledWith('option 2');
  });

  it('passes blur and focus handlers', () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const { getByTestId } = renderSubject({ id: 'test-id', value: 'test-value', onBlur, onFocus });

    const dropdown = getByTestId('SelectFieldDropdown');

    fireEvent.focus(dropdown);
    expect(onFocus).toHaveBeenCalledWith('test-id', 'test-value');

    fireEvent.blur(dropdown);
    expect(onBlur).toHaveBeenCalledWith('test-id', 'test-value');
  });
});
