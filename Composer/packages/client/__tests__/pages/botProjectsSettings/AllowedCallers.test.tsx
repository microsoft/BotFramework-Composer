// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState } from '../../../src/recoilModel';
import { AllowedCallers } from '../../../src/pages/botProject/AllowedCallers';

const state = {
  projectId: '123',
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
    runtimeSettings: {
      skills: {
        allowedCallers: [],
      },
    },
  },
};

describe('Allowed Callers', () => {
  it('should submit settings with new caller added/deleted', async () => {
    const setSettingsMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const component = renderWithRecoilAndCustomDispatchers(
      <AllowedCallers projectId={state.projectId} />,
      initRecoilState
    );

    // Create new caller
    const addCallerBtn = component.getByTestId('addNewAllowedCaller');
    await act(async () => {
      await fireEvent.click(addCallerBtn);
    });
    const addCallerField = component.getByTestId('addCallerInputField');
    await act(async () => {
      await fireEvent.change(addCallerField, {
        target: { value: 'newCaller' },
      });
      await fireEvent.blur(addCallerField);
    });
    expect(setSettingsMock).toBeCalledWith(state.projectId, {
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
      runtimeSettings: { skills: { allowedCallers: ['newCaller'] } },
    });

    // Delete Caller
    const deleteCallerBtn = component.getByTestId('addCallerRemoveBtn');
    await act(async () => {
      await fireEvent.click(deleteCallerBtn);
    });
    expect(setSettingsMock).toBeCalledWith(state.projectId, {
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
      runtimeSettings: { skills: { allowedCallers: [] } },
    });
  });
});
