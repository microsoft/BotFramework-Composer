// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { Icon } from '../../../src/adaptive-flow-renderer/widgets/ActionHeader/icon';

describe('<Icon />', () => {
  let iconList, icon, iconColor;

  beforeEach(() => {
    iconList = ['Friend', 'MessageBot', 'Stop', 'User'];
    iconColor = '#EBEBEB';
  });

  it('renders icon component with invalid icon', () => {
    icon = 'invalidIcon';
    const { findByRole } = render(<Icon color={iconColor} icon={icon} />);
    expect(findByRole('icon')).resolves.toBeTruthy();
  });

  it('renders icon component with valid icon', () => {
    icon = iconList[0];
    const { findByRole } = render(<Icon color={iconColor} icon={icon} />);
    expect(findByRole('icon')).resolves.toBeTruthy();
  });
});
