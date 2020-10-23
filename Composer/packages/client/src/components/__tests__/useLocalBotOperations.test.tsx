// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { RecoilRoot } from 'recoil';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import { act } from '@botframework-composer/test-utils';

import { useLocalBotOperations } from '../TestController/useLocalBotOperations';
import { botProjectIdsState, dispatcherState, projectMetaDataState } from '../../recoilModel';

const state = {
  projectId: '123a.23fs',
  skillId: '456a.23fs',
};

const mocks = {
  resetBotRuntimeError: jest.fn(),
  publishToTarget: jest.fn(),
  setBotStatus: jest.fn(),
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
    resetBotRuntimeError: mocks.resetBotRuntimeError,
    publishToTarget: mocks.publishToTarget,
    setBotStatus: mocks.setBotStatus,
  });
};

describe('useLocalBotOperations', () => {
  afterEach(() => {
    mocks.resetBotRuntimeError.mockReset();
    mocks.publishToTarget.mockReset();
    mocks.setBotStatus.mockReset();
  });

  it('should start skill bot', async () => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useLocalBotOperations(), {
      wrapper,
    });

    await act(async () => {
      result.current.startSingleBot(state.skillId);
    });
    expect(mocks.resetBotRuntimeError).toHaveBeenLastCalledWith(state.skillId);
  });
});
