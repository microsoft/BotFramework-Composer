// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { EmulatorOpenButton } from '../../../src/components/TestController/emulatorOpenButton';
import { BotStatus } from '../../../src/constants';

describe('<EmulatorOpenButton />', () => {
  it('should show the button to open emulator', () => {
    const onClick = jest.fn(() => {});
    const { container, getByText } = render(
      <EmulatorOpenButton
        botEndpoint={'http://localhost:3979/api/messages'}
        botStatus={BotStatus.connected}
        hidden={false}
        onClick={onClick}
      />
    );

    expect(container).toHaveTextContent('Test in Emulator');

    const button = getByText('Test in Emulator');
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });

  it('should hidden the button if set hidden', () => {
    const onClick = jest.fn(() => {});
    const { container } = render(
      <EmulatorOpenButton
        hidden
        botEndpoint={'http://localhost:3979/api/messages'}
        botStatus={BotStatus.connected}
        onClick={onClick}
      />
    );

    expect(container).not.toHaveTextContent('Test in Emulator');
  });

  it('should show the button if the bot status is not connected', () => {
    const onClick = jest.fn(() => {});
    const { container } = render(
      <EmulatorOpenButton
        botEndpoint={'http://localhost:3979/api/messages'}
        botStatus={BotStatus.publishing}
        hidden={false}
        onClick={onClick}
      />
    );

    expect(container).not.toHaveTextContent('Test in Emulator');
  });
});
