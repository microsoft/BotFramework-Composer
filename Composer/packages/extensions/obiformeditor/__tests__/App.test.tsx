import React from 'react';
import { render, waitForElement } from 'react-testing-library';

import OBIEditor from '../src';

describe('<App />', () => {
  it('should render the app', async () => {
    // @ts-ignore
    const { getByText } = render(<OBIEditor data={{ invalid: 'schema' }} focusedSteps={[]} />);

    await waitForElement(() => getByText(/Malformed data/));
  });
});
