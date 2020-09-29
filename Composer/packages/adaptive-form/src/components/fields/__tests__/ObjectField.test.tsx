// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { ObjectField } from '../ObjectField';

import { fieldProps } from './testUtils';

jest.mock('../../FormRow', () => ({
  FormRow: ({ onChange, row }) => {
    return (
      <div data-testid="FormRow">
        <input
          onChange={(e) => {
            try {
              onChange(row)(JSON.parse(e.target.value));
            } catch {
              onChange(row)(e.target.value);
            }
          }}
        />
      </div>
    );
  },
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<ObjectField {...props} />);
}

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
    height: { type: 'number' },
    enabled: { type: 'boolean' },
  },
};

describe.only('<ObjectField />', () => {
  it('does not render if there is no schema', () => {
    const { container } = renderSubject({ schema: undefined });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a form row for each ordered property', () => {
    const uiOptions = {
      order: ['name', ['age', 'height'], '*'],
    };
    const { getAllByTestId } = renderSubject({ uiOptions, schema });
    expect(getAllByTestId('FormRow')).toHaveLength(3);
  });

  it('can edit a specific property', () => {
    const onChange = jest.fn();
    const value = {
      name: 'old name',
      age: 21,
    };

    const { container } = renderSubject({ onChange, schema, value });
    const input = container.querySelectorAll('input')[0];
    fireEvent.change(input, { target: { value: 'new name' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'new name', age: 21 });
  });
});
