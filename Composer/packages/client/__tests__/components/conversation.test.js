import * as React from 'react';
import { cleanup, render, waitForElement } from 'react-testing-library';

import { Conversation } from './../../src/components/Conversation/index';

describe('<Conversation/>', () => {
  afterEach(cleanup);

  it('should render the conversation', async () => {
    const { getByText } = render(
      <Conversation>
        <div>test</div>
      </Conversation>
    );

    await waitForElement(() => getByText(/test/));
  });
});
