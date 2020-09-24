// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, act } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { FieldSets } from '../FieldSets';

import { fieldProps } from './testUtils';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    city: { type: 'string' },
  },
};

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<FieldSets {...props} />);
}

describe('<FieldSets />', () => {
  it('renders an object with two field sets', async () => {
    const onChange = jest.fn();
    const uiOptions = {
      fieldSets: [
        {
          title: 'set 1',
          fields: ['name'],
        },
        {
          title: 'set 2',
        },
      ],
    };

    const { getByLabelText, findByText } = renderSubject({ schema, uiOptions, onChange, value: {} });

    await findByText('set 1');
    await findByText('set 2');

    const nameField = getByLabelText('Name');
    act(() => {
      fireEvent.change(nameField, { target: { value: 'name' } });
    });

    expect(onChange).toHaveBeenLastCalledWith({ name: 'name' });

    const cityField = getByLabelText('City');
    act(() => {
      fireEvent.change(cityField, { target: { value: 'Seattle' } });
    });

    expect(onChange).toHaveBeenLastCalledWith({ city: 'Seattle' });
  });
});
