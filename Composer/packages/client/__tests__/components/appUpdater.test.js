// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from 'react-testing-library';

import { StoreContext } from '../../src/store';
import { AppUpdater } from '../../src/components/AppUpdater';
import { AppUpdaterStatus } from '../../src/constants';

describe('<AppUpdater />', () => {
  let storeContext;
  beforeEach(() => {
    storeContext = {
      actions: {},
      state: {
        appUpdate: {
          progressPercent: 0,
          showing: true,
          status: AppUpdaterStatus.IDLE,
        },
      },
    };
  });

  it('should not render anything when the modal is set to hidden', () => {
    storeContext.state.appUpdate.showing = false;
    const { container } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    expect(container.firstChild).toBeFalsy();
  });

  it('should not render anything when the modal is set to hidden (even when not idle)', () => {
    storeContext.state.appUpdate.showing = false;
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_UNAVAILABLE;
    const { container } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    expect(container.firstChild).toBeFalsy();
  });

  it('should render the update available dialog', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_AVAILABLE;
    storeContext.state.appUpdate.version = '1.0.0';
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('New update available');
    getByText('Bot Framework Composer v1.0.0');
    getByText('Install the update and restart Composer.');
    getByText('Download the new version manually.');
  });

  it('should render the update unavailable dialog', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_UNAVAILABLE;
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('No updates available');
    getByText('Composer is up to date.');
  });

  it('should render the update completed dialog', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_SUCCEEDED;
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('Update complete');
    getByText('Composer will restart.');
  });

  it('should render the update in progress dialog (before total size in known)', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_IN_PROGRESS;
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('0% of Calculating...');
  });

  it('should render the update in progress dialog', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_IN_PROGRESS;
    storeContext.state.appUpdate.progressPercent = 23;
    storeContext.state.appUpdate.downloadSizeInBytes = 14760000;
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('23% of 14.76MB');
  });

  it('should render the error dialog', () => {
    storeContext.state.appUpdate.status = AppUpdaterStatus.UPDATE_FAILED;
    storeContext.state.appUpdate.error = '408 Request timed out.';
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <AppUpdater />
      </StoreContext.Provider>
    );
    getByText('Update failed');
    getByText(`Couldn't complete the update: 408 Request timed out.`);
  });
});
