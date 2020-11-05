// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { RecoilRoot } from 'recoil';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { botProjectIdsState, botStatusState, dispatcherState, projectMetaDataState } from '../../../recoilModel';
import { useStartedRuntimesTracker } from '../../BotRuntimeController/useStartedRuntimesTracker';
import { BotStatus } from '../../../constants';

const state = {
  projectId: '123a.23fs',
  skillId: '456a.23fs',
};

const mocks = {
  resetBotRuntimeError: jest.fn(),
  publishToTarget: jest.fn(),
  setBotStatus: jest.fn(),
};

const initRecoilState = (set) => {
  set(botProjectIdsState, [state.projectId, state.skillId]);
  set(projectMetaDataState(state.projectId), {
    isRootBot: true,
  });
  set(projectMetaDataState(state.skillId), {
    isRootBot: false,
  });

  set(dispatcherState, {
    resetBotRuntimeError: mocks.resetBotRuntimeError,
    publishToTarget: mocks.publishToTarget,
    setBotStatus: mocks.setBotStatus,
  });
};

// TODO: An integration test needs to be added to test this component better.
describe('useBotStatusTracker', () => {
  const onBotStartedAction = jest.fn();
  afterEach(() => {
    onBotStartedAction.mockClear();
  });

  it('should call action once tracked bots started or failed', async () => {
    const rootBotId = '234.2234a';
    const trackedProjectIds = ['124a.asd', '356b.asd'];
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      const updateRecoilState = (set) => {
        set(botProjectIdsState, [rootBotId, ...trackedProjectIds]);
        set(botStatusState(trackedProjectIds[0]), BotStatus.connected);
        set(botStatusState(trackedProjectIds[1]), BotStatus.failed);
      };

      return (
        <RecoilRoot
          initializeState={({ set }) => {
            initRecoilState(set);
            updateRecoilState(set);
          }}
        >
          {children}
        </RecoilRoot>
      );
    };

    renderHook(() => useStartedRuntimesTracker(onBotStartedAction, trackedProjectIds), {
      wrapper,
    });
    expect(onBotStartedAction).toHaveBeenCalledTimes(1);
  });

  it('should not call action if a tracked bot is still running', async () => {
    const rootBotId = '234.2234a';
    const trackedProjectIds = ['124a.asd', '356b.asd'];
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      const updateRecoilState = (set) => {
        set(botProjectIdsState, [rootBotId, ...trackedProjectIds]);
        set(botStatusState(trackedProjectIds[0]), BotStatus.connected);
        set(botStatusState(trackedProjectIds[1]), BotStatus.publishing);
      };

      return (
        <RecoilRoot
          initializeState={({ set }) => {
            initRecoilState(set);
            updateRecoilState(set);
          }}
        >
          {children}
        </RecoilRoot>
      );
    };

    renderHook(() => useStartedRuntimesTracker(onBotStartedAction, trackedProjectIds), {
      wrapper,
    });
    expect(onBotStartedAction).toHaveBeenCalledTimes(0);
  });
});
