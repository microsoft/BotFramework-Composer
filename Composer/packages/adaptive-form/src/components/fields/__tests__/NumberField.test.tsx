// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { NumberField } from '../NumberField';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps({ label: 'number field' }), overrides);
  return render(<NumberField {...props} />);
}

describe('<NumberField />', () => {
  describe('when type is number', () => {
    it('changes the number by 0.01', async () => {
      const onChange = jest.fn();
      const schema = {
        type: 'number',
      };

      const { getByLabelText } = renderSubject({ onChange, schema, value: 0 });
      const upButton = getByLabelText('increment by 0.01');
      const downButton = getByLabelText('decrement by 0.01');

      fireEvent.mouseDown(upButton);
      fireEvent.mouseUp(upButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(0.01);
      onChange.mockReset();

      fireEvent.mouseDown(downButton);
      fireEvent.mouseUp(downButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(-0.01);
    });
  });

  describe('when type is integer', () => {
    it('changes the number by 1', async () => {
      const onChange = jest.fn();
      const schema = {
        type: 'integer',
      };

      const { getByLabelText } = renderSubject({ onChange, schema, value: 0 });
      const upButton = getByLabelText('increment by 1');
      const downButton = getByLabelText('decrement by 1');

      fireEvent.mouseDown(upButton);
      fireEvent.mouseUp(upButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(1);
      onChange.mockReset();

      fireEvent.mouseDown(downButton);
      fireEvent.mouseUp(downButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(-1);
    });
  });

  it('correctly sets the value', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderSubject({ onChange, value: 0 });
    const field = getByLabelText('number field');
    const input = field.querySelector('input');

    expect(input).toHaveValue('0');
  });

  it('has an aria-label fallback', () => {
    const { getByLabelText } = renderSubject({ label: false });
    expect(getByLabelText('numeric field')).toBeInTheDocument();
  });
});
