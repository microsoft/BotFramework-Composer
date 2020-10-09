// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, act } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { Fieldsets } from '../FieldSets';

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
  return render(<Fieldsets {...props} />);
}

describe('<Fieldsets />', () => {
  it('renders an object with two field sets', async () => {
    const onChange = jest.fn();
    const uiOptions = {
      fieldsets: [
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

  it('renders additional fields', async () => {
    const uiOptions = {
      properties: {
        additionalField: {
          additionalField: true,
          field: () => <div>Additional Field</div>,
        },
      },
      fieldsets: [
        {
          title: 'set 1',
          fields: ['name'],
        },
        {
          title: 'set 2',
        },
      ],
    };

    const { findByText } = renderSubject({ schema, uiOptions, value: {} });

    await findByText('Additional Field');
  });
});
