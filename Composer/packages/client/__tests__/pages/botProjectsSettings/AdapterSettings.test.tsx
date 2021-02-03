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
  it('brings up the modal', () => {
    const setSettingsMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const { getByTestId, getByText } = renderWithRecoilAndCustomDispatchers(
      <AdapterSettings projectId={state.projectId} />,
      initRecoilState
    );
    const container = getByTestId('adapterSettings');
    expect(getByText('External service adapters')).toBeInTheDocument();
    const configureButton = within(container).getAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });
    expect(getByTestId('adapterModal')).toBeInTheDocument();
  });
});
