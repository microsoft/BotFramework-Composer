// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';

import { DeleteBotButton } from '../../../src/pages/botProject/DeleteBotButton';
import { renderWithRecoil } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';

const state = {
  projectId: 'test',
};

describe('Delete Bot Button', () => {
  const setSettingsMock = jest.fn(() => {});
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      setSettings: setSettingsMock,
    });
  };

  it('should render Delete Bot Button', () => {
    const { getByText } = renderWithRecoil(<DeleteBotButton projectId={state.projectId} />, initRecoilState);
    getByText('Delete');
  });

  //   it('should submit settings', () => {
  //     const { getByTestId, getByText } = renderWithRecoil(<DeleteBotButton projectId={state.projectId} />, initRecoilState);
  //     const textField = getByText('SkillHostEndPointTextField');
  //     act(() => {
  //       fireEvent.change(textField, {
  //         target: { value: 'mySkillHostEndPoint' },
  //       });
  //     });
  //     expect(setSettingsMock).toBeCalled();
  //   });
});
