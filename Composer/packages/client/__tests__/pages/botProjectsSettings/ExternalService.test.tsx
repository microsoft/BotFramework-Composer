// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { ExternalService } from '../../../src/pages/botProject/ExternalService';
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

describe('External Service', () => {
  it('should submit settings', () => {
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
      <ExternalService projectId={state.projectId} />,
      initRecoilState
    );
    const textField1 = getByTestId('rootLUISKey');
    act(() => {
      fireEvent.change(textField1, {
        target: { value: 'myRootLUISKey' },
      });
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: 'myRootLUISKey',
      },
    });
    const textField2 = getByTestId('rootLUISRegion');
    act(() => {
      fireEvent.change(textField2, {
        target: { value: 'myRootLUISRegion' },
      });
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringRegion: 'myRootLUISRegion',
      },
    });
    const textField3 = getByTestId('QnASubscriptionKey');
    act(() => {
      fireEvent.change(textField3, {
        target: { value: 'myQnASubscriptionKey' },
      });
    });
    act(() => {
      fireEvent.blur(textField3);
    });
    expect(setQnASettingsMock).toBeCalledWith('test', 'myQnASubscriptionKey');
  });
});
