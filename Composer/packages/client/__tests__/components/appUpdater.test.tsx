// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { AppUpdater } from '../../src/components/AppUpdater/AppUpdater';
import { AppUpdaterStatus } from '../../src/constants';
import { renderWithStore } from '../testUtils';

describe('<AppUpdater />', () => {
  let state;
  beforeEach(() => {
    state = {
      appUpdate: {
        progressPercent: 0,
        showing: true,
        status: AppUpdaterStatus.IDLE,
      },
    };
  });

  it('should not render anything when the modal is set to hidden', () => {
    state.appUpdate.showing = false;
    const { container } = renderWithStore(<AppUpdater />, state);
    expect(container.firstChild).toBeFalsy();
  });

  it('should not render anything when the modal is set to hidden (even when not idle)', () => {
    state.appUpdate.showing = false;
    state.appUpdate.status = AppUpdaterStatus.UPDATE_UNAVAILABLE;
    const { container } = renderWithStore(<AppUpdater />, state);
    expect(container.firstChild).toBeFalsy();
  });

  it('should render the update available dialog', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_AVAILABLE;
    state.appUpdate.version = '1.0.0';
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('New update available');
    getByText('Bot Framework Composer v1.0.0');
    getByText('Install the update and restart Composer.');
    getByText('Download now and install when you close Composer.');
  });

  it('should render the update unavailable dialog', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_UNAVAILABLE;
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('No updates available');
    getByText('Composer is up to date.');
  });

  it('should render the update completed dialog', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_SUCCEEDED;
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('Update complete');
    getByText('Composer will restart.');
  });

  it('should render the update in progress dialog (before total size in known)', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_IN_PROGRESS;
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('0% of Calculating...');
  });

  it('should render the update in progress dialog', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_IN_PROGRESS;
    state.appUpdate.progressPercent = 23;
    state.appUpdate.downloadSizeInBytes = 14760000;
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('23% of 14.76MB');
  });

  it('should render the error dialog', () => {
    state.appUpdate.status = AppUpdaterStatus.UPDATE_FAILED;
    state.appUpdate.error = '408 Request timed out.';
    const { getByText } = renderWithStore(<AppUpdater />, state);
    getByText('Update failed');
    getByText(`Couldn't complete the update: 408 Request timed out.`);
  });
});
