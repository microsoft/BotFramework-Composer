import * as React from 'react';
import { cleanup, render, waitForElement } from 'react-testing-library';

import { NavItem } from '../src/components/NavItem';

describe('<Header />', () => {
  afterEach(cleanup);

  it('should render a nav item', async () => {
    const { getByText } = render(<NavItem label={'some nav item'} to={'/'} />);

    await waitForElement(() => getByText(/some nav item/));
  });
});
