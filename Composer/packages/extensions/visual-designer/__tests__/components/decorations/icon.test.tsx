import React from 'react';
import { render } from 'react-testing-library';

import { Icon } from '../../../src/components/decorations/icon';

describe('<Icon />', () => {
  let iconList, icon, iconColor;

  beforeEach(() => {
    iconList = ['Friend', 'MessageBot', 'Stop', 'User'];
    iconColor = '#EBEBEB';
  });

  it('renders icon component with invalid icon', async () => {
    icon = 'invalidIcon';
    const { findByRole } = render(<Icon icon={icon} color={iconColor} />);
    expect(findByRole('icon')).resolves.toBe({});
  });

  it('renders icon component with valid icon', async () => {
    icon = iconList[0];
    const { findByRole } = render(<Icon icon={icon} color={iconColor} />);
    expect(findByRole('icon')).resolves.toBeTruthy();
  });
});
