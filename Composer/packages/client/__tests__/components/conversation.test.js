import * as React from 'react';
import { render } from 'react-testing-library';

import { Conversation } from './../../src/components/Conversation/index';

describe('<Conversation/>', () => {
  it('should render the conversation', async () => {
    const { findByText } = render(
      <Conversation>
        <div>test</div>
      </Conversation>
    );

    await findByText(/test/);
  });
});
