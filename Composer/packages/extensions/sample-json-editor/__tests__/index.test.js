import * as React from 'react';
import { render, waitForElement } from 'react-testing-library';

import JsonEditor from '../src';

describe('<JsonEditor />', () => {
  it('should render the json editor', async () => {
    const { getByText } = render(<JsonEditor data={{ content: 'hello world!' }} />);

    await waitForElement(() => getByText(/hello world!/));
  });
});
