// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { OpenEmulatorButton } from '../../../src/components/TestController/OpenEmulatorButton';
import { botEndpointsState, botStatusState, settingsState } from '../../../src/recoilModel';
import { BotStatus } from '../../../src/constants';
import { renderWithRecoil } from '../../testUtils';

const mockOpenBotInEmulator = jest.fn();

jest.mock('../../../src/utils/navigation', () => ({
  openInEmulator: mockOpenBotInEmulator,
}));

jest.mock('office-ui-fabric-react/lib/Button', () => ({
  ActionButton: ({ onClick, children }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
  IconButton: ({ onClick, children }) => (
    <button data-testid="iconButton" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('office-ui-fabric-react/lib/Tooltip', () => ({
  TooltipHost: ({ children }) => <div>{children}</div>,
}));

const projectId = '123.abc';

const initialState = ({ currentStatus = BotStatus.connected } = {}) => ({ set }) => {
  set(botStatusState(projectId), currentStatus);
  set(botEndpointsState, { [projectId]: 'http://open-in-emulator/api/messages' });
  set(settingsState(projectId), {});
};

describe('<OpenEmulatorButton />', () => {
  beforeEach(() => {
    mockOpenBotInEmulator.mockClear();
  });

  fit('should show the button to open emulator', async () => {
    const { findByTestId } = renderWithRecoil(<OpenEmulatorButton projectId={projectId} />, initialState());

    const button = await findByTestId('button');
    fireEvent.click(button);
    expect(mockOpenBotInEmulator).toHaveBeenCalled();
  });

  it('should not show the button if the status is not `BotStatus.connected`', () => {
    const { container } = renderWithRecoil(
      <OpenEmulatorButton projectId={projectId} />,
      initialState({ currentStatus: BotStatus.pending })
    );
    expect(container).not.toHaveTextContent('Test in Emulator');
  });
});
