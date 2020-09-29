// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, within, getByText } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { OpenObjectField } from '../OpenObjectField';

const defaultProps = {
  onChange: jest.fn(),
  value: {},
  depth: 0,
  definitions: {},
  schema: {
    additionalProperties: false,
  },
  id: 'test',
  name: 'test name',
  uiOptions: {},
};

function renderSubject(overrides = {}) {
  const props = assign({}, defaultProps, overrides);
  return render(<OpenObjectField {...props} />);
}

describe('<OpenObjectField />', () => {
  it('renders an object item for each entry', () => {
    const value = {
      foo: 'foo value',
      bar: 'bar value',
      baz: 'baz value',
    };
    const onChange = jest.fn();
    const { getAllByTestId } = renderSubject({ value, onChange });

    const items = getAllByTestId('ObjectItem');
    expect(items).toHaveLength(3);

    const fooItem = items[0];

    const { getByDisplayValue, getByTestId } = within(fooItem);
    const fooValue = getByDisplayValue('foo value');
    expect(fooValue).toBeInTheDocument();
    fireEvent.change(fooValue as HTMLInputElement, { target: { value: 'new foo value' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'new foo value',
      })
    );

    const fooName = getByDisplayValue('foo');
    expect(fooName).toBeInTheDocument();
    fireEvent.change(fooName as HTMLInputElement, { target: { value: 'newFoo' } });
    fireEvent.blur(fooName as HTMLInputElement);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        newFoo: 'new foo value',
      })
    );

    const fooActions = getByTestId('ObjectItemActions');
    expect(fooActions).toBeInTheDocument();
    fireEvent.click(fooActions as HTMLElement);
    fireEvent.click(getByText(document.body, 'Remove'));
    expect(onChange).toHaveBeenCalledWith(
      expect.not.objectContaining({
        foo: 'foo value',
      })
    );
  });

  describe('adding more items', () => {
    it('allows adding more items if the schema allows it', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = renderSubject({ schema: { additionalProperties: true }, onChange });

      fireEvent.change(getByPlaceholderText('Add a new key'), { target: { value: 'newKey' } });
      fireEvent.change(getByPlaceholderText('Add a new value'), { target: { value: 'new value' } });

      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(getByPlaceholderText('Add a new value'), { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          newKey: 'new value',
        })
      );
    });
  });
});
