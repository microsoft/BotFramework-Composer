import * as React from 'react';
import { render } from 'react-testing-library';

import { BASEPATH } from '../src/constants/index';

import { NotFound } from '../src/components/NotFound';

describe('<NotFound />', () => {
  it('should render a not found page', async () => {
    const { findByText } = render(<NotFound />);

    await findByText(/The page you are looking for can't be found./);
    await findByText(/404/);
  });

  it('should render null on BASEPATH', async () => {
    expect(NotFound({ uri: BASEPATH })).toBeNull();
  });
});
