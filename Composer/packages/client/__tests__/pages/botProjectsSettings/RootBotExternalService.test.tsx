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
  luFilesSelectorFamily,
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
      set(luFilesSelectorFamily(state.projectId), state.luFiles);
      set(projectMetaDataState(state.projectId), state.projectMetaDataState);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
        setQnASettings: setQnASettingsMock,
      });
    };

    const { getByTestId, findByText } = renderWithRecoilAndCustomDispatchers(
      <RootBotExternalService projectId={state.projectId} />,
      initRecoilState,
    );

    const textFieldAuthoring = getByTestId('rootLUISAuthoringKey');
    await act(async () => {
      fireEvent.change(textFieldAuthoring, {
        target: { value: 'myRootLUISKey' },
      });
    });
    await act(async () => {
      fireEvent.blur(textFieldAuthoring);
    });

    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: 'myRootLUISKey',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
    });

    const regionDropdown = getByTestId('rootLUISRegion');
    await act(async () => {
      fireEvent.click(regionDropdown);
      const option = await findByText('West US');
      fireEvent.click(option);
      fireEvent.blur(regionDropdown);
    });

    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: '',
        authoringRegion: 'westus',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
    });

    const textFieldSubscription = getByTestId('QnASubscriptionKey');
    await act(async () => {
      await fireEvent.change(textFieldSubscription, {
        target: { value: 'myQnASubscriptionKey' },
      });
      await fireEvent.blur(textFieldSubscription);
    });

    expect(setSettingsMock).toBeCalledWith('test', {
      luis: {
        authoringKey: '',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: 'myQnASubscriptionKey',
      },
    });

    expect(setQnASettingsMock).toBeCalledWith('test', 'myQnASubscriptionKey');
  });
});
