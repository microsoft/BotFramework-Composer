import * as React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Conversation } from './../../src/components/Conversation/index';

describe('<Conversation/>', () => {
  it('should render the conversation', async () => {
    const { getByText } = render(
      <Conversation>
        <div>test</div>
      </Conversation>
    );

    await waitForElement(() => getByText(/test/));
  });
});
