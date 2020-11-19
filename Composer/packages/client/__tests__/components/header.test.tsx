// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../testUtils';
import { Header } from '../../src/components/Header';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = renderWithRecoil(<Header />);
    expect(container).toHaveTextContent('Bot Framework Composer');
  });

  it('should not show the start bots widget in Home page', async () => {
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'http://server/home',
    });
    const { queryByText } = renderWithRecoil(<Header />);
    expect(queryByText('Start all bots')).toBeNull();
  });

  it('should show the start bots widget on design page', async () => {
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'http://server/design',
    });
    const result = renderWithRecoil(<Header />);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });

  it('should show the start bots widget on settings page', async () => {
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'http://server/settings',
    });
    const result = renderWithRecoil(<Header />);
    expect(result.queryByText('Start all bots')).not.toBeNull();
  });
});
