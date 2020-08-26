// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { useTriggerApi } from '../../src/shell/triggerApi';
import {
  projectIdState,
  localeState,
  luFilesState,
  lgFilesState,
  dialogsState,
  schemasState,
  dispatcherState,
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
  let selectToMock, updateDialogMock, createLgTemplatesMock, createLuIntentMock, result;
  beforeEach(() => {
    selectToMock = jest.fn();
    updateDialogMock = jest.fn();
    createLgTemplatesMock = jest.fn();
    createLuIntentMock = jest.fn();

    const initRecoilState = ({ set }) => {
      set(projectIdState, state.projectId);
      set(localeState, 'en-us');
      set(luFilesState, state.luFiles);
      set(lgFilesState, state.lgFiles);
      set(dialogsState, state.dialogs);
      set(schemasState, state.schemas);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        selectTo: selectToMock,
        updateDialog: updateDialogMock,
        createLgTemplates: createLgTemplatesMock,
        createLuIntent: createLuIntentMock,
      }));
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };
    const rendered = renderHook(() => useTriggerApi(), {
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
    expect(createLgTemplatesMock).toBeCalledTimes(1);
    expect(updateDialogMock).toBeCalledTimes(1);
    expect(createLgTemplatesMock).toBeCalledTimes(1);
    expect(updateDialogMock).toBeCalledTimes(1);
  });
});
