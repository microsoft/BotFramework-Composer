// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@bfc/test-utils';

import { SkillHostEndPoint } from '../../../src/pages/botProject/SkillHostEndPoint';
import { renderWithRecoil } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState } from '../../../src/recoilModel';
import { Dispatcher } from '../../../src/recoilModel/dispatchers';

const state = {
  projectId: 'test',
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
  },
};

describe('SkillHostEndPoint', () => {
  it('should submit settings', () => {
    const setSettingsMock = jest.fn(() => {});
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        setSettings: setSettingsMock,
      }));
    };
    const { getByTestId } = renderWithRecoil(<SkillHostEndPoint projectId={state.projectId} />, initRecoilState);
    const textField = getByTestId('SkillHostEndPointTextField');
    act(() => {
      fireEvent.change(textField, {
        target: { value: 'mySkillHostEndPoint' },
      });
    });
    expect(setSettingsMock).toBeCalledWith('');
  });
});
