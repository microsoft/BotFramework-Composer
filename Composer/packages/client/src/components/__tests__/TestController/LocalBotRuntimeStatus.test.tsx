// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import httpClient from '../../../utils/httpUtil';
import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botRuntimeErrorState, botStatusState } from '../../../recoilModel';
import { BotStatus } from '../../../constants';
import { LocalBotRuntimeStatus } from '../../TestController/LocalBotRuntimeStatus';

jest.mock('../../../utils/httpUtil');

const mockStart = jest.fn();
const mockStop = jest.fn();
const pollingInterval = 3000;

jest.mock('../../TestController/useLocalBotOperations', () => {
  return {
    useLocalBotOperations: () => ({
      startSingleBot: mockStart,
      stopSingleBot: mockStop,
    }),
  };
});

describe('<LocalBotStatusIndicator />', () => {
  const projectId = '123a.324';

  beforeEach(() => {
    mockStop.mockClear();
    mockStart.mockClear();
  });

  it('should start the bot once its published', async () => {
    renderWithRecoil(<LocalBotRuntimeStatus projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.published);
    });

    expect(mockStart).toHaveBeenCalledWith(projectId, true);
  });

  describe('<Poll Operations />', () => {
    const updatePublishStatusMock = jest.fn();
    (httpClient.get as jest.Mock).mockImplementation(() => {
      updatePublishStatusMock();
      return new Promise((resolve) => {
        resolve({
          status: 200,
          data: {
            status: 200,
          },
        });
      });
    });
    beforeEach(() => {
      jest.useFakeTimers();
      updatePublishStatusMock.mockClear();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not poll if bot is started', async () => {
      renderWithRecoil(<LocalBotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.connected);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(0);
    });

    it('should not poll if bot is stopped', async () => {
      renderWithRecoil(<LocalBotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.failed);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(0);
    });

    it('should poll if bot is loading', async () => {
      renderWithRecoil(<LocalBotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.reloading);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(pollingInterval);

      expect(updatePublishStatusMock).toHaveBeenCalledTimes(2);
    });

    it('should show error if bot start failed', async () => {
      const { findByText } = renderWithRecoil(<LocalBotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.failed);
        set(botRuntimeErrorState(projectId), {
          title: 'Error',
          message: 'Failed to bind to port 3979',
        });
      });
      expect(findByText('See details')).toBeDefined();
    });
  });
});
