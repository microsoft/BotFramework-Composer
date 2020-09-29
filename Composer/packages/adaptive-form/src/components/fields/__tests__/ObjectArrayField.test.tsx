// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import assign from 'lodash/assign';
import { useShellApi } from '@bfc/extension-client';

import { ObjectArrayField } from '../ObjectArrayField';

import { fieldProps } from './testUtils';

const testSchema = (moreItems: object = {}) => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name Label' },
      age: { type: 'integer', title: 'Age Label' },
      ...moreItems,
    },
  },
});

jest.mock('../ArrayFieldItem', () => ({
  ArrayFieldItem: ({ stackArrayItems }) => <div>{stackArrayItems ? 'stacked' : 'not stacked'}</div>,
}));
jest.mock('@bfc/extension-client', () => ({
  useShellApi: jest.fn(),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps({ schema: { items: [{ type: 'object' }] } }), overrides);
  return render(<ObjectArrayField {...props} />);
}

describe('<ObjectArrayField />', () => {
  let announce = jest.fn();
  const value = [
    {
      name: 'foo',
      age: 12,
    },
    {
      name: 'bar',
      age: 23,
    },
  ];

  beforeEach(() => {
    announce = jest.fn();
    (useShellApi as jest.Mock).mockReturnValue({
      shellApi: { announce },
    });
  });

  describe('invalid item schema', () => {
    it.each([undefined, [], true])('renders unsupported field for item schema %p', (itemSchema) => {
      const { getByTestId } = renderSubject({ schema: { items: itemSchema } });
      expect(getByTestId('UnsupportedField')).toBeInTheDocument();
    });
  });

  describe('when fields are not stacked', () => {
    it('it adds new items by inline inputs', () => {
      const onChange = jest.fn();
      const { getAllByText, getByPlaceholderText, queryAllByText } = renderSubject({
        schema: testSchema(),
        value,
        onChange,
      });
      expect(getAllByText('not stacked')).toHaveLength(2);
      expect(queryAllByText('stacked')).toHaveLength(0);

      const name = getByPlaceholderText('Add new name');
      fireEvent.change(name, { target: { value: 'new name' } });
      fireEvent.keyDown(name, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith([...value, { name: 'new name' }]);
      expect(announce).toHaveBeenCalledWith(expect.stringContaining('press Enter to add'));
      expect(name).toHaveFocus();
    });

    it('serializes the value when adding a new item', () => {
      const onChange = jest.fn();
      const uiOptions = {
        properties: {
          name: {
            serializer: {
              set: (val) => `serialized ${val}`,
            },
          },
        },
      };
      const { getByPlaceholderText } = renderSubject({
        schema: testSchema(),
        value,
        uiOptions,
        onChange,
      });

      const name = getByPlaceholderText('Add new name');
      fireEvent.change(name, { target: { value: 'new name' } });
      fireEvent.keyDown(name, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith([...value, { name: 'serialized new name' }]);
    });

    it('can override the new input placeholder', () => {
      const uiOptions = {
        properties: {
          name: {
            placeholder: 'Name Custom Placeholder',
          },
          age: {
            placeholder: () => 'Age Custom Placeholder',
          },
        },
      };
      const { getByPlaceholderText } = renderSubject({ schema: testSchema(), value, uiOptions });

      expect(getByPlaceholderText('Name Custom Placeholder')).toBeInTheDocument();
      expect(getByPlaceholderText('Age Custom Placeholder')).toBeInTheDocument();
    });
  });

  describe('when fields are stacked', () => {
    it('stacks if there are more than 2 properties', () => {
      const onChange = jest.fn();
      const { getAllByText, getByText, queryAllByText } = renderSubject({
        schema: testSchema({ height: { type: 'number' } }),
        value,
        onChange,
      });
      expect(getAllByText('stacked')).toHaveLength(2);
      expect(queryAllByText('not stacked')).toHaveLength(0);

      const add = getByText('Add');
      fireEvent.click(add);
      expect(onChange).toHaveBeenCalledWith([...value, {}]);
    });

    it('stacks if at least one property is an expression', () => {
      const { getAllByText, queryAllByText } = renderSubject({
        schema: testSchema({ age: { $role: 'expression' } }),
        value,
      });
      expect(getAllByText('stacked')).toHaveLength(2);
      expect(queryAllByText('not stacked')).toHaveLength(0);
    });

    it('stacks if there are more than 2 ordered properties', () => {
      const { getAllByText, queryAllByText } = renderSubject({
        schema: testSchema({ height: { type: 'number' } }),
        uiOptions: { order: ['name', ['age', 'height']] },
        value,
      });
      expect(getAllByText('stacked')).toHaveLength(2);
      expect(queryAllByText('not stacked')).toHaveLength(0);
    });
  });
});
