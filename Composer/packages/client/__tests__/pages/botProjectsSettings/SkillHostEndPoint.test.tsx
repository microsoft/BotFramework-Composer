// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';
import { fireEvent, act } from '@bfc/test-utils';

import { SkillHostEndPoint } from '../../../src/pages/botProject/SkillHostEndPoint';
import { renderWithRecoil } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';

const state = {
  projectId: 'test',
};

describe('SkillHostEndPoint', () => {
  const setSettingsMock = jest.fn(() => {});
  const initRecoilState = ({ set }) => {
    //set(settingsState(state.projectId), state.settings);
    set(dispatcherState, {
      setSettings: setSettingsMock,
    });
  };

  it('should render SkillHostEndPoint', () => {
    const { getByTestId } = renderWithRecoil(<SkillHostEndPoint projectId={state.projectId} />, initRecoilState);
    getByTestId('SkillHostEndPointTextField');
  });

  it('should submit settings', () => {
    const { getByTestId } = renderWithRecoil(<SkillHostEndPoint projectId={state.projectId} />, initRecoilState);
    const textField = getByTestId('SkillHostEndPointTextField');
    fireEvent.change(textField, {
      target: { value: 'mySkillHostEndPoint' },
    });
    expect(setSettingsMock).toBeCalled();
  });
});
