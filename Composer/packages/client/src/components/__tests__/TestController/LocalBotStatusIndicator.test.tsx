// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botRuntimeErrorState, botStatusState } from '../../../recoilModel';
import { BotStatus, BotStatusesCopy } from '../../../constants';
import { LocalBotStatusIndicator } from '../../TestController/LocalBotStatusIndicator';

jest.mock('../../../utils/httpUtil');

const mockStart = jest.fn();
const mockStop = jest.fn();

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

  it('should render the Local Bot Runtime with publishing status', async () => {
    const { findAllByText } = renderWithRecoil(<LocalBotStatusIndicator projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.publishing);
    });
    const element = await findAllByText(BotStatusesCopy.publishing);
    expect(element).toBeDefined();
  });

  it('should show error if bot start failed', async () => {
    const { findByText } = renderWithRecoil(<LocalBotStatusIndicator projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.failed);
      set(botRuntimeErrorState(projectId), {
        title: 'Error',
        message: 'Failed to bind to port 3979',
      });
    });
    expect(findByText('See details')).toBeDefined();
  });
});
