import * as React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { NotFound } from '../src/components/NotFound';

describe('<NotFound />', () => {
  it('should render a not found page', async () => {
    const { getByText } = render(<NotFound />);

    await waitForElement(() => getByText(/The page you are looking for can't be found./));
    await waitForElement(() => getByText(/404/));
  });
});
