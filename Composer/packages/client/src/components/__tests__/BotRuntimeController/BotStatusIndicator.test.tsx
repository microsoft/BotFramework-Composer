// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botRuntimeErrorState, botStatusState } from '../../../recoilModel';
import { BotStatus, BotStatusesCopy } from '../../../constants';
import { BotStatusIndicator } from '../../BotRuntimeController/BotStatusIndicator';

jest.mock('../../../utils/httpUtil');

const mockStart = jest.fn();
const mockStop = jest.fn();

jest.mock('../../BotRuntimeController/useBotOperations', () => {
  return {
    useBotOperations: () => ({
      startSingleBot: mockStart,
      stopSingleBot: mockStop,
    }),
  };
});

describe('<BotStatusIndicator />', () => {
  const projectId = '123a.324';

  beforeEach(() => {
    mockStop.mockClear();
    mockStart.mockClear();
  });

  it('should render the Local Bot Runtime with publishing status', async () => {
    const { findAllByText } = renderWithRecoil(<BotStatusIndicator projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.publishing);
    });
    const element = await findAllByText(BotStatusesCopy.publishing);
    expect(element).toBeDefined();
  });

  it('should show error if bot start failed', async () => {
    const { findByText } = renderWithRecoil(<BotStatusIndicator projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.failed);
      set(botRuntimeErrorState(projectId), {
        title: 'Error',
        message: 'Failed to bind to port 3979',
      });
    });
    expect(findByText('See Details')).toBeDefined();
  });
});
