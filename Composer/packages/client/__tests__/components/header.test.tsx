// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { within } from '@testing-library/dom';

import { renderWithRecoil } from '../testUtils';
import { Header } from '../../src/components/Header';
import { useLocation } from '../../src/utils/hooks';

jest.mock('../../src/utils/hooks');

describe('<Header />', () => {
  it('should render the header', () => {
    (useLocation as jest.Mock).mockImplementation(() => {
      return { location: { pathname: 'http://server/home' } };
    });
    const { container } = renderWithRecoil(<Header />);
    expect(within(container).findByAltText('Composer Logo')).not.toBeNull();
  });

  it('should not show the start bots widget in Home page', async () => {
    (useLocation as jest.Mock).mockImplementation(() => {
      return { location: { pathname: 'http://server/home' } };
    });
    const { queryByText } = renderWithRecoil(<Header />);
    expect(queryByText('Start all')).toBeNull();
  });

  it('should show the start bots widget on design page', async () => {
    (useLocation as jest.Mock).mockImplementation(() => {
      return { location: { pathname: 'http://server/bot/1234/dialogs' } };
    });
    const result = renderWithRecoil(<Header />);
    expect(result.findAllByDisplayValue('Start all')).not.toBeNull();
  });

  it('should show the start bots widget on settings page', async () => {
    (useLocation as jest.Mock).mockImplementation(() => {
      return { location: { pathname: 'http://server/bot/1234/settings' } };
    });
    const result = renderWithRecoil(<Header />);
    expect(result.findAllByDisplayValue('Start all')).not.toBeNull();
  });
});
