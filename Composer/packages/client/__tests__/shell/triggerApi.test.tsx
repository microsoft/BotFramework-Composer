// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { useTriggerApi } from '../../src/shell/triggerApi';
import {
  localeState,
  luFilesSelectorFamily,
  lgFilesSelectorFamily,
  dialogsSelectorFamily,
  schemasState,
  dispatcherState,
  currentProjectIdState,
} from '../../src/recoilModel';
import { Dispatcher } from '../../src/recoilModel/dispatchers';

const state = {
  dialogs: [
    {
      id: 'test',
      content: {},
    },
  ],
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [],
    },
  ],
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [],
    },
  ],
  schemas: { sdk: { content: {} } },
  focusPath: '',
  locale: 'en-us',
  projectId: 'test',
};

describe('use triggerApi hooks', () => {
  let createTriggerMock, result;
  beforeEach(() => {
    createTriggerMock = jest.fn();

    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(localeState(state.projectId), 'en-us');
      set(luFilesSelectorFamily(state.projectId), state.luFiles);
      set(lgFilesSelectorFamily(state.projectId), state.lgFiles);
      set(dialogsSelectorFamily(state.projectId), state.dialogs);
      set(schemasState(state.projectId), state.schemas);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        createTrigger: createTriggerMock,
      }));
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };
    const rendered = renderHook(() => useTriggerApi(state.projectId), {
      wrapper,
    });
    result = rendered.result;
  });

  it('should create QnA trigger', async () => {
    const dialogId = 'test';
    const formData = {
      $kind: 'Microsoft.OnQnAMatch',
      errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
      event: '',
      intent: '',
      regEx: '',
      triggerPhrases: '',
    };
    await result.current.createTrigger(dialogId, formData);
    const arg = [state.projectId, dialogId, formData, true];
    expect(createTriggerMock).toBeCalledWith(...arg);
  });
});
