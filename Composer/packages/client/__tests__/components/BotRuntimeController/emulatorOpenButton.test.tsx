// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, act } from '@botframework-composer/test-utils';

import { OpenEmulatorButton } from '../../../src/components/BotRuntimeController/OpenEmulatorButton';
import { botEndpointsState, botStatusState, settingsState } from '../../../src/recoilModel';
import { BotStatus } from '../../../src/constants';
import { renderWithRecoil } from '../../testUtils';

const mockCallEmulator = jest.fn();

jest.mock('../../../src/utils/navigation', () => {
  return {
    openInEmulator: mockCallEmulator,
  };
});

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
  it('should show the button to open emulator', async () => {
    mockCallEmulator.mockImplementationOnce((url) => {
      expect(url).toBeDefined();
    });
    const { findByTestId } = renderWithRecoil(<OpenEmulatorButton isRootBot projectId={projectId} />, initialState());
    const button = await findByTestId('button');
    act(() => {
      fireEvent.click(button);
    });
  });

  it('should not show the button if the status is not `BotStatus.connected`', () => {
    const { container } = renderWithRecoil(
      <OpenEmulatorButton isRootBot projectId={projectId} />,
      initialState({ currentStatus: BotStatus.pending })
    );
    expect(container).not.toHaveTextContent('Test in Emulator');
  });
});
