// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import httpClient from '../../../utils/httpUtil';
import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botRuntimeErrorState, botStatusState } from '../../../recoilModel';
import { BotStatus } from '../../../constants';
import { BotRuntimeStatus } from '../../BotRuntimeController/BotRuntimeStatus';

jest.mock('../../../utils/httpUtil');

const mockStart = jest.fn();
const mockStop = jest.fn();
const pollingInterval = 1500;

jest.mock('../../BotRuntimeController/useBotOperations', () => {
  return {
    useBotOperations: () => ({
      startSingleBot: mockStart,
      stopSingleBot: mockStop,
    }),
  };
});

describe('<BotRuntimeStatus />', () => {
  const projectId = '123a.324';

  beforeEach(() => {
    mockStop.mockClear();
    mockStart.mockClear();
  });

  it('should start the bot once its published', async () => {
    renderWithRecoil(<BotRuntimeStatus projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.published);
    });

    expect(mockStart).toHaveBeenCalledWith(projectId, true);
  });

  describe('<Poll Operations />', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });
    afterAll(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

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
      updatePublishStatusMock.mockClear();
    });

    it('should not poll if bot is started', async () => {
      renderWithRecoil(<BotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.connected);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(0);
    });

    it('should not poll if bot is stopped', async () => {
      renderWithRecoil(<BotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.failed);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(0);
    });

    it('should poll if bot is loading', async () => {
      renderWithRecoil(<BotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.starting);
      });

      jest.advanceTimersByTime(pollingInterval);
      expect(updatePublishStatusMock).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(pollingInterval);

      expect(updatePublishStatusMock).toHaveBeenCalledTimes(2);
    });

    it('should show error if bot start failed', async () => {
      const { findByText } = renderWithRecoil(<BotRuntimeStatus projectId={projectId} />, ({ set }) => {
        set(botStatusState(projectId), BotStatus.failed);
        set(botRuntimeErrorState(projectId), {
          title: 'Error',
          message: 'Failed to bind to port 3979',
        });
      });
      expect(findByText('See Details')).toBeDefined();
    });
  });
});
