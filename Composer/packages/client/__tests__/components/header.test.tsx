// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../testUtils';
import { Header } from '../../src/components/Header';
import { currentModeState } from '../../src/recoilModel';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = renderWithRecoil(<Header />);
    expect(container).toHaveTextContent('Bot Framework Composer');
  });

  it('should not show the start bots widget in Home page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'home');
    };
    const { queryByText } = renderWithRecoil(<Header />, initRecoilState);
    expect(queryByText('Start all bots')).toBeNull();
  });

  it('should show the start bots widget on design page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'design');
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });

  it('should show the start bots widget on settings page', async () => {
    const initRecoilState = ({ set }) => {
      set(currentModeState, 'settings');
    };
    const result = renderWithRecoil(<Header />, initRecoilState);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });
});
