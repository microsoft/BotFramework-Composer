// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { BotStatus } from '../../../constants';
import { botProjectIdsState, botStatusState } from '../../../recoilModel';
import { BotController } from '../../BotRuntimeController/BotController';

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockSingleStop = jest.fn();
const mockSingleStart = jest.fn();

jest.mock('office-ui-fabric-react/lib/Button', () => ({
  DefaultButton: ({ children, onClick }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
  IconButton: ({ onClick }) => (
    <button data-testid="Close" onClick={onClick}>
      Close
    </button>
  ),
}));

jest.mock('../../BotRuntimeController/useBotOperations', () => {
  return {
    useBotOperations: () => ({
      startAllBots: mockStart,
      stopAllBots: mockStop,
      startSingleBot: mockSingleStart,
      stopSingleBot: mockSingleStop,
    }),
  };
});

// BotController Menu is tested in its own test file
jest.mock('../../BotRuntimeController/BotControllerMenu', () => {
  return {
    BotControllerMenu: () => {
      return <></>;
    },
  };
});

describe('<BotController />', () => {
  beforeEach(() => {
    mockStop.mockReset();
    mockStart.mockReset();
  });

  it('should show that 2/3 bots have been started correctly', async () => {
    const initRecoilState = ({ set }) => {
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.connected);
      set(botStatusState(projectIds[1]), BotStatus.connected);
      set(botStatusState(projectIds[2]), BotStatus.failed);
    };
    const { findByText } = renderWithRecoil(
      <BotController isControllerHidden={false} onHideController={jest.fn()} />,
      initRecoilState
    );
    await findByText('Restart all bots (2/3 running)');
  });

  it('should show that no bots have been started', async () => {
    const initRecoilState = ({ set }) => {
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.inactive);
      set(botStatusState(projectIds[1]), BotStatus.inactive);
      set(botStatusState(projectIds[2]), BotStatus.inactive);
    };
    const { findByText } = renderWithRecoil(
      <BotController isControllerHidden={false} onHideController={jest.fn()} />,
      initRecoilState
    );
    await findByText('Start all bots');
  });

  it('should stop all bots if Stop all bots is clicked', async () => {
    const initRecoilState = ({ set }) => {
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.published);
      set(botStatusState(projectIds[1]), BotStatus.publishing);
      set(botStatusState(projectIds[2]), BotStatus.connected);
    };
    const { findByTestId } = renderWithRecoil(
      <BotController isControllerHidden={false} onHideController={jest.fn()} />,
      initRecoilState
    );
    const button = await findByTestId('button');

    act(() => {
      fireEvent.click(button);
    });
    expect(mockStop).toHaveBeenCalled();
  });

  it('should start all bots if Start All bots is clicked', async () => {
    const initRecoilState = ({ set }) => {
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.inactive);
      set(botStatusState(projectIds[1]), BotStatus.inactive);
      set(botStatusState(projectIds[2]), BotStatus.inactive);
    };
    const { findByTestId } = renderWithRecoil(
      <BotController isControllerHidden={false} onHideController={jest.fn()} />,
      initRecoilState
    );
    const button = await findByTestId('button');

    act(() => {
      fireEvent.click(button);
    });

    expect(mockStart).toHaveBeenCalled();
  });

  it('should show that bots are starting', async () => {
    const initRecoilState = ({ set }) => {
      const projectIds = ['123a.234', '456a.234', '789a.234', '1323.sdf'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.published);
      set(botStatusState(projectIds[1]), BotStatus.publishing);
      set(botStatusState(projectIds[2]), BotStatus.connected);
      set(botStatusState(projectIds[3]), BotStatus.queued);
    };
    const { findByText } = renderWithRecoil(
      <BotController isControllerHidden={false} onHideController={jest.fn()} />,
      initRecoilState
    );
    await findByText('Starting bots.. (1/4 running)');
  });
});
