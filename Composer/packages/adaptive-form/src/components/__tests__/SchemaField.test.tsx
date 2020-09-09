// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, waitFor, fireEvent } from '@bfc/test-utils';
import { FieldProps, useFormConfig } from '@bfc/extension';
import assign from 'lodash/assign';

import { SchemaField } from '../SchemaField';
import { getUIOptions } from '../../utils/getUIOptions';
import { resolveFieldWidget } from '../../utils/resolveFieldWidget';

jest.mock('../../utils/getUIOptions', () => ({
  getUIOptions: jest.fn(),
}));

jest.mock('../../utils/resolveFieldWidget', () => ({
  resolveFieldWidget: jest.fn(),
}));

jest.mock('@bfc/extension', () => ({
  useFormConfig: jest.fn(),
}));

const defaultProps: FieldProps = {
  onChange: jest.fn(),
  depth: 0,
  id: 'test-id',
  name: 'test-name',
  definitions: { foo: { type: 'string' } },
  schema: {
    type: 'boolean',
  },
  uiOptions: {
    label: 'default label',
    order: ['*'],
  },
};

function renderSubject(overrides: Partial<FieldProps> = {}) {
  const props = assign({}, defaultProps, overrides);

  return render(<SchemaField {...props} />);
}

describe('<SchemaField />', () => {
  beforeEach(() => {
    (useFormConfig as jest.Mock).mockReturnValue('form ui options');
    (resolveFieldWidget as jest.Mock).mockReturnValue(({ value, onChange, rawErrors }) => (
      <div>
        <input data-testid="resolved-field" value={value} onChange={(e) => onChange(e.target.value)} />
        {typeof rawErrors === 'object' && <span data-testid="test-error">{JSON.stringify(rawErrors)}</span>}
      </div>
    ));
    (defaultProps.onChange as jest.Mock).mockReset();
  });

  it('does not render if field is a $', () => {
    const { container } = renderSubject({ name: '$kind' });
    expect(container).toBeEmptyDOMElement();
  });

  it('merges ui options with the resolved schema', () => {
    (getUIOptions as jest.Mock).mockReturnValue({ label: 'resolved label' });
    renderSubject();

    expect(getUIOptions).toHaveBeenCalledWith(defaultProps.schema, 'form ui options');
  });

  describe('when no value set', () => {
    it('does not set the value if a default or const is not provided', async () => {
      renderSubject({ value: 'foo' });
      await waitFor(() => {
        expect(defaultProps.onChange).not.toHaveBeenCalled();
      });
    });

    it('sets the value if a default is provided', async () => {
      renderSubject({ value: undefined, schema: { ...defaultProps.schema, default: 'foo' } });

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith('foo');
      });
    });

    it('sets the value if a const is provided', async () => {
      renderSubject({ value: undefined, schema: { ...defaultProps.schema, const: 'bar', default: 'foo' } });

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalledWith('bar');
      });
    });
  });

  describe('value serialization', () => {
    const uiOptions = {
      serializer: {
        get: (val) => `serialized ${val}`,
        set: (val) => val?.replace('serialized', '') ?? '',
      },
    };

    it('deserializes the value before passing to the field', () => {
      const { getByTestId } = renderSubject({ uiOptions, value: 'foo' });

      expect(getByTestId('resolved-field')).toHaveValue('serialized foo');
    });

    it('serializes the value when the value changes', () => {
      const { getByTestId } = renderSubject({ uiOptions, value: 'foo' });
      const input = getByTestId('resolved-field');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(defaultProps.onChange).toHaveBeenCalledWith('new value');
    });

    it('does not attempt to serialize if not getter or setter', () => {
      const { getByTestId } = renderSubject({ value: 'foo' });
      const input = getByTestId('resolved-field');

      expect(input).toHaveValue('foo');

      fireEvent.change(input, { target: { value: 'new value' } });
      expect(defaultProps.onChange).toHaveBeenCalledWith('new value');
    });
  });

  describe('errors', () => {
    it('passes appropriate rawErrors to the field', () => {
      const { getByTestId } = renderSubject({ rawErrors: { 'test-name': { nested: 'nested error' } } });
      const error = getByTestId('test-error');

      expect(error).toHaveTextContent('{"nested":"nested error"}');
    });

    it('renders an ErrorMessage if error is a string', async () => {
      const { findByTestId } = renderSubject({ rawErrors: 'test error' });
      expect(await findByTestId('FieldErrorMessage')).toBeInTheDocument();
    });

    it('does not render an error if error is an object', () => {
      const { getByTestId } = renderSubject({ rawErrors: { foo: 'test error' } });
      expect(() => getByTestId('FieldErrorMessage')).toThrow();
    });
  });

  it('resolves the correct field widget', () => {
    const { getByTestId } = renderSubject();
    expect(getByTestId('resolved-field')).toBeInTheDocument();
  });
});
