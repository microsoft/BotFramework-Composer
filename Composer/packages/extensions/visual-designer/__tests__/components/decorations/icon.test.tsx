// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { Icon } from '../../../src/components/decorations/icon';

describe('<Icon />', () => {
  let iconList, icon, iconColor;

  beforeEach(() => {
    iconList = ['Friend', 'MessageBot', 'Stop', 'User'];
    iconColor = '#EBEBEB';
  });

  it('renders icon component with invalid icon', () => {
    icon = 'invalidIcon';
    const { findByRole } = render(<Icon icon={icon} color={iconColor} />);
    expect(findByRole('icon')).resolves.toBeTruthy();
  });

  it('renders icon component with valid icon', () => {
    icon = iconList[0];
    const { findByRole } = render(<Icon icon={icon} color={iconColor} />);
    expect(findByRole('icon')).resolves.toBeTruthy();
  });
});
