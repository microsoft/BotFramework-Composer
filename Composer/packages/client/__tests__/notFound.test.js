import * as React from 'react';
import { cleanup, render, waitForElement } from 'react-testing-library';

import { NotFound } from '../src/components/NotFound';

describe('<NotFound />', () => {
  afterEach(cleanup);

  it('should render a not found page', async () => {
    const { getByText } = render(<NotFound />);

    await waitForElement(() => getByText(/The page you are looking for can't be found./));
    await waitForElement(() => getByText(/404123/));
  });
});
