// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@botframework-composer/test-utils';

import { Loading } from '../../../src/components/BotRuntimeController/loading';
import { BotStatus } from '../../../src/constants';

describe('<Loading />', () => {
  it('should render <Loading />', () => {
    const { container, rerender } = render(<Loading botStatus={BotStatus.publishing} />);

    expect(container).toHaveTextContent('Publishing');

    rerender(<Loading botStatus={BotStatus.connected} />);

    expect(container).not.toHaveTextContent('Publishing');
    expect(container).not.toHaveTextContent('Reloading');
  });
});
