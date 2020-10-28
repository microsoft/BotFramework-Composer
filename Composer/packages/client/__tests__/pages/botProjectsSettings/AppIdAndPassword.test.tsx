// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@bfc/test-utils';

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
  it('should submit settings', () => {
    const setSettingsMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <AppIdAndPassword required projectId={state.projectId} />,
      initRecoilState
    );
    const textField1 = getByTestId('MicrosoftAppId');
    act(() => {
      fireEvent.change(textField1, {
        target: { value: 'myMicrosoftAppId' },
      });
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      defaultLanguage: 'en-us',
      languages: ['en-us', 'fr-fr'],
      MicrosoftAppId: 'myMicrosoftAppId',
    });
    const textField2 = getByTestId('MicrosoftPassword');
    act(() => {
      fireEvent.change(textField2, {
        target: { value: 'myMicrosoftPassword' },
      });
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      defaultLanguage: 'en-us',
      languages: ['en-us', 'fr-fr'],
      MicrosoftAppPassword: 'myMicrosoftPassword',
    });
  });
});
