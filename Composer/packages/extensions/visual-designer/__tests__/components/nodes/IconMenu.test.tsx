import React from 'react';
import { render, fireEvent, findByText } from 'react-testing-library';

import { IconMenu } from '../../../src/components/nodes/templates/IconMenu';

describe('<IconMenu />', () => {
  let menuItems, iconName, onClick;

  beforeEach(() => {
    onClick = jest.fn();
    iconName = 'iconMenu';
    menuItems = [
      {
        key: 'item0',
        name: 'item0',
        onClick: () => {
          onClick(0);
        },
      },
      {
        key: 'item1',
        name: 'item1',
        onClick: () => {
          onClick(1);
        },
      },
      {
        key: 'item2',
        name: 'item2',
        onClick: () => {
          onClick(2);
        },
      },
    ];
  });

  it('renders icon menu', () => {
    const { getByTestId } = render(<IconMenu iconName={iconName} menuItems={menuItems} />);

    expect(getByTestId('iconMenu')).toBeTruthy();
  });
  it('menu items can be clicked', async () => {
    const { findByTestId } = render(<IconMenu iconName={iconName} menuItems={menuItems} />);

    const iconMenu = await findByTestId('iconMenu');
    let menuItem;

    for (let i = 0; i < menuItems.length; i++) {
      fireEvent.click(iconMenu);

      menuItem = await findByText(document.body, menuItems[i].name);

      fireEvent.click(menuItem);
      expect(onClick).toHaveBeenCalledWith(i);
    }
  });
});
