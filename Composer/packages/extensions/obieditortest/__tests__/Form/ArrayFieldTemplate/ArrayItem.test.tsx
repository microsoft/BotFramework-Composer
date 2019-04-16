import React from 'react';
import { render, fireEvent, findAllByText } from 'react-testing-library';

import ArrayItem from '../../../src/Form/ArrayFieldTemplate/ArrayItem';

describe('<ArrayItem />', () => {
  it('does not render a context menu if no actions can be made', () => {
    const { queryByTestId } = render(
      <ArrayItem>
        <div>element 1</div>
      </ArrayItem>
    );

    const menuButton = queryByTestId('ArrayItemContextMenu');
    expect(menuButton).toBe(null);
  });

  describe('when there are actions that can be made', () => {
    let renderResult, onReorderClick, onDropIndexClick, clickResults;

    beforeEach(() => {
      clickResults = {
        onReorderClick: [],
        onDropIndexClick: [],
      };

      onReorderClick = (...args) => {
        return () => {
          clickResults.onReorderClick.push(args);
        };
      };
      onDropIndexClick = (...args) => {
        return () => {
          clickResults.onDropIndexClick.push(args);
        };
      };

      renderResult = render(
        <ArrayItem
          hasMoveUp
          hasMoveDown
          hasRemove
          onReorderClick={onReorderClick}
          onDropIndexClick={onDropIndexClick}
          index={3}
        >
          <div>element 1</div>
        </ArrayItem>
      );
    });

    async function getMenuItems(itemName?: string): Promise<HTMLElement[]> {
      const { findByTestId } = renderResult;
      const menuButton = await findByTestId('ArrayItemContextMenu');
      expect(menuButton).toBeTruthy();
      fireEvent.click(menuButton);

      if (itemName) {
        return findAllByText(document.body, itemName);
      }

      return findAllByText(document.body, /(Move Up|Move Down|Remove)/);
    }

    it('renders a context menu with available actions', async () => {
      const menuItems = await getMenuItems();

      expect(menuItems).toHaveLength(3);
    });

    it('can move an item up', async () => {
      const [moveUpItem] = await getMenuItems('Move Up');

      fireEvent.click(moveUpItem);
      expect(clickResults.onReorderClick).toEqual([[3, 2]]);
    });

    it('can move an item down', async () => {
      const [moveDownItem] = await getMenuItems('Move Down');

      fireEvent.click(moveDownItem);
      expect(clickResults.onReorderClick).toEqual([[3, 4]]);
    });

    it('can remove an item', async () => {
      const [removeItem] = await getMenuItems('Remove');

      fireEvent.click(removeItem);
      expect(clickResults.onDropIndexClick).toEqual([[3]]);
    });
  });
});
