// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@testing-library/react';

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
