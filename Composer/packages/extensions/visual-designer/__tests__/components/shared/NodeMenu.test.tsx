import React from 'react';
import { render, fireEvent, findAllByText } from 'react-testing-library';

import { NodeMenu } from '../../../src/components/shared/NodeMenu';
import { NodeEventTypes } from '../../../src/shared/NodeEventTypes';

describe('<NodeMenu />', () => {
  let id, onEvent, renderResult, clickResults;

  beforeEach(() => {
    onEvent = (...args) => {
      clickResults.onDelete.push(args);
    };
    id = 'nodeMenu';
    clickResults = {
      onDelete: [],
    };

    renderResult = render(<NodeMenu id={id} onEvent={onEvent} />);
  });

  async function getMenuItems(itemName?: string): Promise<HTMLElement[]> {
    const { findByTestId } = renderResult;
    const menuButton = await findByTestId('iconMenu');
    expect(menuButton).toBeTruthy();

    fireEvent.click(menuButton);

    if (itemName) {
      return findAllByText(document.body, itemName);
    }

    return findAllByText(document.body, /(Delete)/);
  }

  it('can be delete', async () => {
    const [deleteItem] = await getMenuItems('Delete');

    fireEvent.click(deleteItem);
    expect(clickResults.onDelete).toEqual([[NodeEventTypes.Delete, { id: 'nodeMenu' }]]);
  });

  it('renders menu with available actions', async () => {
    const menuItems = await getMenuItems();

    expect(menuItems).toHaveLength(1);
  });
});
