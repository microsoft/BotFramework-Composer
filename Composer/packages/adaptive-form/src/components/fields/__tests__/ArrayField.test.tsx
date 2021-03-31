// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { ArrayField } from '../ArrayField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps({ value: [], schema: { items: [{ type: 'number' }] } }), overrides);
  return render(<ArrayField {...props} />);
}

describe('<ArrayField />', () => {
  describe('invalid item schema', () => {
    it.each([[], true, undefined])('renders unsupported field when item schema is %p', (itemSchema) => {
      const { getByTestId } = renderSubject({ schema: { items: itemSchema } });
      expect(getByTestId('UnsupportedField')).toBeInTheDocument();
    });
  });

  it('renders an array item for each value', () => {
    const { getAllByTestId } = renderSubject({ value: [1, 2, 3] });
    expect(getAllByTestId('ArrayFieldItem')).toHaveLength(3);
  });

  it('can add new items', async () => {
    const onChange = jest.fn();

    const { getByText, findByTestId } = renderSubject({ onChange });

    const button = getByText('Add new');
    fireEvent.click(button);

    const input = await findByTestId('string-field');
    fireEvent.change(input, { target: { value: 'new value' } });

    console.log('here', onChange.mock.calls);
    expect(onChange.mock.calls).toEqual([[[]], [['new value']]]);
  });
});
