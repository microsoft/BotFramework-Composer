import * as React from 'react';
import { render } from 'react-testing-library';

import { NavItem } from '../src/components/NavItem';

describe('<Header />', () => {
  it('should render a nav item', async () => {
    const { findByText } = render(<NavItem labelName={'some nav item'} to={'/'} />);

    await findByText(/some nav item/);
  });
});
