// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { SkillHostEndPoint } from '../../../src/pages/botProject/SkillHostEndPoint';
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

describe('SkillHostEndPoint', () => {
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
      <SkillHostEndPoint projectId={state.projectId} />,
      initRecoilState
    );
    const textField = getByTestId('SkillHostEndPointTextField');
    await act(async () => {
      await fireEvent.change(textField, {
        target: { value: 'mySkillHostEndPoint' },
      });
      await fireEvent.blur(textField);
    });
    expect(setSettingsMock).toBeCalledWith('test', {
      defaultLanguage: 'en-us',
      languages: ['en-us', 'fr-fr'],
      skillHostEndpoint: 'mySkillHostEndPoint',
      luis: {
        authoringKey: '',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
    });
  });
});
