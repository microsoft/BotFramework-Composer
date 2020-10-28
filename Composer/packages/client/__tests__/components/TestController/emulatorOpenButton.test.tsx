// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';

import { OpenEmulatorButton } from '../../../src/components/TestController/OpenEmulatorButton';
import { BotStatus } from '../../../src/constants';

const projectId = '123.abc';

describe('<OpenEmulatorButton />', () => {
  it('should show the button to open emulator', () => {
    const onClick = jest.fn(() => {});
    const { container, getByText } = render(<OpenEmulatorButton projectId={projectId} />);

    expect(container).toHaveTextContent('Test in Emulator');

    const button = getByText('Test in Emulator');
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });

  it('should hidden the button if set hidden', () => {
    const { container } = render(<OpenEmulatorButton projectId={projectId} />);

    expect(container).not.toHaveTextContent('Test in Emulator');
  });

  it('should show the button if the bot status is not connected', () => {
    const { container } = render(<OpenEmulatorButton projectId={projectId} />);

    expect(container).not.toHaveTextContent('Test in Emulator');
  });
});
