import React from 'react';
import { render, waitForElement } from 'react-testing-library';

import OBIEditor from '../src';

describe('<App />', () => {
  it('should render the app', async () => {
    const { getByText } = render(<OBIEditor data={{ invalid: 'schema' }} />);

    await waitForElement(() => getByText(/Unsupported field schema/));
  });
});
