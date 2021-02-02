// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, within } from '@botframework-composer/test-utils';

import AdapterSettings from '../../../src/pages/botProject/adapters/AdapterSettings';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState } from '../../../src/recoilModel';

const state = {
  projectId: 'test',
  settings: {},
};

describe('AdapterSettings', () => {
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
      <AdapterSettings projectId={state.projectId} />,
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
