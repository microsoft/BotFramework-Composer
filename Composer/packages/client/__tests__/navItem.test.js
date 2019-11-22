// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from 'react-testing-library';

import { NavItem } from '../src/components/NavItem';
import { StoreProvider } from '../src/store';

describe('<Header />', () => {
  it('should render a nav item', async () => {
    const { findByText } = render(
      <StoreProvider>
        <NavItem labelName={'some nav item'} to={'/'} />
      </StoreProvider>
    );

    await findByText(/some nav item/);
  });
});
