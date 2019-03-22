import * as React from 'react';
import { cleanup, render, waitForElement } from 'react-testing-library';

import OBIEditor from '../src';

describe('<App />', () => {
  afterEach(cleanup);

  it('should render the app', async () => {
    const { getByText } = render(<OBIEditor data={{ invalid: 'schema' }} />);

    await waitForElement(() => getByText(/Unsupported field schema/));
  });
});
