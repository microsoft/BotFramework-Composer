// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, getByText, waitFor } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { ObjectItem } from '../ObjectItem';

const defaultProps = {
  name: 'foo',
  formData: { foo: 'value' },
  value: 'value',
  schema: {},
  onNameChange: jest.fn(),
  onChange: jest.fn(),
  onDelete: jest.fn(),
};

function renderSubject(overrides = {}) {
  const props = assign({}, defaultProps, overrides);

  return render(<ObjectItem {...props} />);
}

describe('<ObjectItem />', () => {
  describe('changing the name', () => {
    it('does not allow a blank name', async () => {
      const onNameChange = jest.fn();
      const { getByDisplayValue, getByText } = renderSubject({ onNameChange });

      const input = getByDisplayValue('foo');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      expect(onNameChange).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(getByText('Key cannot be blank')).toBeInTheDocument();
      });
    });

    it('does not allow duplicate names', async () => {
      const onNameChange = jest.fn();
      const formData = {
        foo: 'value',
        bar: 'value 2',
      };
      const { getByDisplayValue, getByText } = renderSubject({ onNameChange, formData });

      const input = getByDisplayValue('foo');
      fireEvent.change(input, { target: { value: 'bar' } });
      fireEvent.blur(input);

      expect(onNameChange).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(getByText('Keys must be unique')).toBeInTheDocument();
      });
    });

    it('can update the name', () => {
      const onNameChange = jest.fn();
      const { getByDisplayValue } = renderSubject({ onNameChange });

      const input = getByDisplayValue('foo');
      fireEvent.change(input, { target: { value: 'new name' } });
      fireEvent.blur(input);

      expect(onNameChange).toHaveBeenCalledWith('new name');
    });

    it('uses the initial name as a placeholder', () => {
      const { getByDisplayValue, getByPlaceholderText } = renderSubject();

      const input = getByDisplayValue('foo');
      fireEvent.change(input, { target: { value: '' } });

      expect(getByPlaceholderText('foo')).toBeInTheDocument();
    });

    it('has a fallback placeholder', () => {
      const { getByPlaceholderText } = renderSubject({ name: undefined });
      expect(getByPlaceholderText('Add a new key')).toBeInTheDocument();
    });
  });

  describe('changing the value', () => {
    it('can update the value', () => {
      const onChange = jest.fn();
      const { getByDisplayValue } = renderSubject({ onChange });

      const input = getByDisplayValue('value');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('shows the initial value as placeholder', () => {
      const { getByDisplayValue, getByPlaceholderText } = renderSubject();

      const input = getByDisplayValue('value');
      fireEvent.change(input, { target: { value: '' } });

      expect(getByPlaceholderText('value')).toBeInTheDocument();
    });

    it('has a fallback placeholder', () => {
      const { getByPlaceholderText } = renderSubject({ value: '' });
      expect(getByPlaceholderText('Add a new value')).toBeInTheDocument();
    });
  });

  it('can delete an item', () => {
    const onDelete = jest.fn();
    const { getByTestId } = renderSubject({ onDelete });

    const menu = getByTestId('ObjectItemActions');

    fireEvent.click(menu);

    fireEvent.click(getByText(document.body, 'Remove'));

    expect(onDelete).toHaveBeenCalled();
  });
});
