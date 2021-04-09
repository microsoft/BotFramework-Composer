// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { ArrayFieldItem } from '../ArrayFieldItem';

import { fieldProps } from './testUtils';

function renderSubject(overrides = {}) {
  const props = assign(
    {
      index: 0,
      canMoveUp: false,
      canMoveDown: false,
      canRemove: false,
      onReorder: jest.fn(),
      onRemove: jest.fn(),
    },
    fieldProps(),
    overrides
  );

  return render(<ArrayFieldItem {...props} />);
}

describe('<ArrayFieldItem />', () => {
  describe('context menu', () => {
    it('disables the action if prop is false', () => {
      const { getByLabelText } = renderSubject();
      const menu = getByLabelText('Item actions');
      fireEvent.click(menu);
      const items = screen.getAllByRole('menuitem');
      expect(items).toHaveLength(3);
      items.forEach((item) => {
        expect(item).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('allows moving up, down and removing', () => {
      const onReorder = jest.fn();
      const onRemove = jest.fn();
      const { getByLabelText } = renderSubject({
        index: 2,
        canRemove: true,
        canMoveDown: true,
        canMoveUp: true,
        onRemove,
        onReorder,
      });

      const menu = getByLabelText('Item actions');
      fireEvent.click(menu);
      const moveUp = screen.getByText('Move up');
      fireEvent.click(moveUp);
      expect(onReorder).toHaveBeenCalledWith(1);

      fireEvent.click(menu);
      const moveDown = screen.getByText('Move down');
      fireEvent.click(moveDown);
      expect(onReorder).toHaveBeenCalledWith(3);

      fireEvent.click(menu);
      const remove = screen.getByText('Remove');
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenCalled();
    });
  });

  it('removes itself on blur if there is no value', () => {
    const onRemove = jest.fn();
    const { container } = renderSubject({
      canRemove: true,
      onRemove,
      value: '',
    });
    const field = container.querySelector('input');
    // @ts-ignore
    fireEvent.blur(field);
    expect(onRemove).toHaveBeenCalled();
  });

  it('removes itself on blur if there is no value', () => {
    const onRemove = jest.fn();
    const { container } = renderSubject({
      canRemove: true,
      onRemove,
      value: { foo: '' },
    });
    const field = container.querySelector('input');
    // @ts-ignore
    fireEvent.blur(field);
    expect(onRemove).toHaveBeenCalled();
  });

  it('shows a label if the items are stacked', () => {
    const { getByLabelText } = renderSubject({
      schema: { type: 'object', properties: { foo: { title: 'Foo Title' } } },
      stackArrayItems: true,
    });

    expect(getByLabelText('Foo Title')).toBeInTheDocument();
  });

  it('passes correct error message', async () => {
    const { findByText } = renderSubject({
      rawErrors: ['error 1', 'error 2'],
      index: 1,
    });

    expect(await findByText('error 2')).toBeInTheDocument();
  });
});
