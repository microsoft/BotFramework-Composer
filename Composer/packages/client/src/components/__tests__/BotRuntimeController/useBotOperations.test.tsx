// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { RecoilRoot } from 'recoil';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import { act } from '@botframework-composer/test-utils';
import { defaultPublishConfig } from '@bfc/shared';

import { useBotOperations } from '../../BotRuntimeController/useBotOperations';
import { botProjectIdsState, dispatcherState, projectMetaDataState } from '../../../recoilModel';

const state = {
  projectId: '123a.23fs',
  skillId: '456a.23fs',
};

const mocks = {
  resetBotRuntimeLog: jest.fn(),
  publishToTarget: jest.fn(),
  setBotStatus: jest.fn(),
  stopBot: jest.fn(),
};

const initRecoilState = ({ set }) => {
  set(botProjectIdsState, [state.projectId, state.skillId]);
  set(projectMetaDataState(state.projectId), {
    isRootBot: true,
  });
  set(projectMetaDataState(state.skillId), {
    isRootBot: false,
  });

  set(dispatcherState, {
    resetBotRuntimeLog: mocks.resetBotRuntimeLog,
    publishToTarget: mocks.publishToTarget,
    setBotStatus: mocks.setBotStatus,
    stopPublishBot: mocks.stopBot,
  });
};

// TODO: An integration test needs to be added to test this component better.
describe('useBotOperations', () => {
  afterEach(() => {
    mocks.resetBotRuntimeLog.mockReset();
    mocks.publishToTarget.mockReset();
    mocks.setBotStatus.mockReset();
    mocks.stopBot.mockReset();
  });

  it('should start a single bot', async () => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useBotOperations(), {
      wrapper,
    });

    await act(async () => {
      result.current.startSingleBot(state.skillId);
    });
    expect(mocks.resetBotRuntimeLog).toHaveBeenLastCalledWith(state.skillId);
    expect(mocks.publishToTarget).toHaveBeenLastCalledWith(
      state.skillId,
      defaultPublishConfig,
      { comment: '' },
      {
        MicrosoftAppPassword: '',
        luis: {
          authoringKey: '',
          endpointKey: '',
        },
        qna: {
          endpointKey: '',
          subscriptionKey: '',
        },
      }
    );
  });

  it('should stop a single bot', async () => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useBotOperations(), {
      wrapper,
    });

    await act(async () => {
      result.current.stopSingleBot(state.skillId);
    });
    expect(mocks.stopBot).toHaveBeenLastCalledWith(state.skillId);
  });
});
