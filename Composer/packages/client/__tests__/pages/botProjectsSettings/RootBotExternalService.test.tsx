// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { RootBotExternalService } from '../../../src/pages/botProject/RootBotExternalService';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import {
  settingsState,
  currentProjectIdState,
  projectMetaDataState,
  botProjectIdsState,
  dialogState,
  luFilesState,
} from '../../../src/recoilModel';

const state = {
  dialogs: [
    {
      content: {
        recognizer: '',
      },
      id: 'dialog1',
    },
    {
      content: {
        recognizer: '',
      },
      id: 'dialog2',
    },
  ],
  qnaFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  luFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  projectId: 'test',
  settings: {},
  projectMetaDataState: {
    isRootBot: true,
    isRemote: false,
  },
  botProjectIdsState: ['test'],
};

describe('Root Bot External Service', () => {
  it('should submit settings', async () => {
    const setSettingsMock = jest.fn();
    const setQnASettingsMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(dialogState({ projectId: state.projectId, dialogId: state.dialogs[0].id }), state.dialogs[0]);
      set(dialogState({ projectId: state.projectId, dialogId: state.dialogs[1].id }), state.dialogs[1]);
      set(botProjectIdsState, state.botProjectIdsState);
      set(luFilesState(state.projectId), state.luFiles);
      set(projectMetaDataState(state.projectId), state.projectMetaDataState);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
        setQnASettings: setQnASettingsMock,
      });
    };
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <RootBotExternalService projectId={state.projectId} />,
      initRecoilState
    );
    const textField1 = getByTestId('rootLUISKey');
    await act(async () => {
      await fireEvent.change(textField1, {
        target: { value: 'myRootLUISKey' },
      });
      await fireEvent.blur(textField1);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: 'myRootLUISKey',
        authoringRegion: '',
      },
      qna: {
        subscriptionKey: '',
      },
    });
    const textField2 = getByTestId('rootLUISRegion');
    await act(async () => {
      await fireEvent.change(textField2, {
        target: { value: 'myRootLUISRegion' },
      });
      await fireEvent.blur(textField2);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: '',
        authoringRegion: 'myRootLUISRegion',
      },
      qna: {
        subscriptionKey: '',
      },
    });
    const textField3 = getByTestId('QnASubscriptionKey');
    await act(async () => {
      await fireEvent.change(textField3, {
        target: { value: 'myQnASubscriptionKey' },
      });
      await fireEvent.blur(textField3);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: '',
        authoringRegion: '',
      },
      qna: {
        subscriptionKey: 'myQnASubscriptionKey',
      },
    });
    expect(setQnASettingsMock).toBeCalledWith('test', 'myQnASubscriptionKey');
  });
});
