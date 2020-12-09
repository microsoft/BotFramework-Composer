// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { AppIdAndPassword } from '../../../src/pages/botProject/AppIdAndPassword';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState } from '../../../src/recoilModel';

const state = {
  projectId: 'test',
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
  },
};

describe('App Id and Password', () => {
  it('should submit settings', async () => {
    const setSettingsMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <AppIdAndPassword projectId={state.projectId} />,
      initRecoilState
    );
    const textField1 = getByTestId('MicrosoftAppId');
    await act(async () => {
      await fireEvent.change(textField1, {
        target: { value: 'myMicrosoftAppId' },
      });
      await fireEvent.blur(textField1);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      defaultLanguage: 'en-us',
      languages: ['en-us', 'fr-fr'],
      luis: {
        authoringKey: '',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
      MicrosoftAppId: 'myMicrosoftAppId',
    });
    const textField2 = getByTestId('MicrosoftPassword');
    await act(async () => {
      await fireEvent.change(textField2, {
        target: { value: 'myMicrosoftPassword' },
      });
      await fireEvent.blur(textField2);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      defaultLanguage: 'en-us',
      languages: ['en-us', 'fr-fr'],
      luis: {
        authoringKey: '',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
      MicrosoftAppPassword: 'myMicrosoftPassword',
    });
  });
});
