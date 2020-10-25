// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../testUtils';
import { Header } from '../../src/components/Header';
import { botProjectIdsState, botStatusState, currentModeState } from '../../src/recoilModel';
import { BotStatus } from '../../src/constants';

const mockStart = jest.fn();
const mockStop = jest.fn();

jest.mock('../../src/components/TestController/useLocalBotOperations', () => {
  return {
    useLocalBotOperations: () => ({
      startAllBots: mockStart,
      stopAllBots: mockStop,
    }),
  };
});

describe('<Header />', () => {
  beforeEach(() => {
    mockStop.mockReset();
    mockStart.mockReset();
  });
  it('should render the header', () => {
    const { container } = renderWithRecoil(<Header />);
    expect(container).toHaveTextContent('Bot Framework Composer');
  });

  it('should not show the start bots widget in Home page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'home');
    };
    const { queryByText } = renderWithRecoil(<Header />, initRecoilState);
    expect(queryByText('Start all bots')).toBeNull();
  });

  it('should show the start bots widget on design page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });

  it('should show the start bots widget on settings page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'settings');
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });

  it('should show that 2/3 bots have been started correctly', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.connected);
      set(botStatusState(projectIds[1]), BotStatus.connected);
      set(botStatusState(projectIds[2]), BotStatus.failed);
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Stop all bots (2/3 running)')).not.toBeNull();
  });

  it('should show that no bots have been started', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.published);
      set(botStatusState(projectIds[1]), BotStatus.publishing);
      set(botStatusState(projectIds[2]), BotStatus.failed);
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });

  it('should stop all bots if Stop all bots is clicked', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.published);
      set(botStatusState(projectIds[1]), BotStatus.publishing);
      set(botStatusState(projectIds[2]), BotStatus.connected);
    };
    const { findByLabelText } = renderWithRecoil(<Header />, initRecoilState);
    const element = await findByLabelText('Stop all bots');
    if (element) {
      act(() => {
        fireEvent.click(element);
      });
    }
    expect(mockStop).toHaveBeenCalled();
  });

  it('should start all bots if Start All bots is clicked', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
      const projectIds = ['123a.234', '456a.234', '789a.234'];
      set(botProjectIdsState, projectIds);
      set(botStatusState(projectIds[0]), BotStatus.unConnected);
      set(botStatusState(projectIds[1]), BotStatus.unConnected);
      set(botStatusState(projectIds[2]), BotStatus.unConnected);
    };
    const { findByLabelText } = renderWithRecoil(<Header />, initRecoilState);
    const element = await findByLabelText('Start all bots');
    if (element) {
      act(() => {
        fireEvent.click(element);
      });
    }
    expect(mockStart).toHaveBeenCalled();
  });
});
