// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, within } from '@botframework-composer/test-utils';

import { BotLanguage } from '../../../src/pages/botProject/BotLanguage';
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

describe('Bot Language', () => {
  it('should submit settings', () => {
    const setSettingsMock = jest.fn();
    const setLocaleMock = jest.fn();
    const deleteLanguages = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
        setLocale: setLocaleMock,
        deleteLanguages: deleteLanguages,
      });
    };
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <BotLanguage projectId={state.projectId} />,
      initRecoilState
    );
    const defaultLanguageContainer = getByTestId('defaultLanguage');
    expect(within(defaultLanguageContainer).getByText('English (United States)')).toBeInTheDocument();
    const setDefaultLanguage = getByTestId('setDefaultLanguage');
    act(() => {
      fireEvent.click(setDefaultLanguage);
    });
    expect(setLocaleMock).toBeCalledWith('fr-fr', 'test');
    const remove = getByTestId('remove');
    act(() => {
      fireEvent.click(remove);
    });
    expect(deleteLanguages).toBeCalledWith({ languages: ['fr-fr'], projectId: 'test' });
  });
});
