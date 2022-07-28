// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { NavItem } from '../src/components/NavItem';

import { renderWithRecoil } from './testUtils';

describe('<Header />', () => {
  it('should render a nav item', async () => {
    const { findByTestId } = renderWithRecoil(
      <NavItem showTooltip disabled={false} iconName={''} labelName={'some nav item'} to={'/'} />
    );

    await findByTestId('ActiveLeftNavItem');
  });
});
