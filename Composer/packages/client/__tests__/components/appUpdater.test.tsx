// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { AppUpdater } from '../../src/components/AppUpdater';
import { AppUpdaterStatus } from '../../src/constants';
import { renderWithRecoil } from '../testUtils';
import { appUpdateState } from '../../src/recoilModel';
import { AppUpdateState } from '../../src/recoilModel/types';

describe('<AppUpdater />', () => {
  const baseState: AppUpdateState = {
    progressPercent: 0,
    showing: true,
    status: AppUpdaterStatus.IDLE,
  };

  it('should not render anything when the modal is set to hidden', () => {
    const { container } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
      });
    });
    expect(container.children[1]).toBeFalsy();
  });

  it('should not render anything when the modal is set to hidden (even when not idle)', () => {
    const { container } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        showing: false,
        status: AppUpdaterStatus.UPDATE_UNAVAILABLE,
      });
    });
    expect(container.firstChild).toBeFalsy();
  });

  it('should render the update available dialog', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        version: '1.0.0',
        status: AppUpdaterStatus.UPDATE_AVAILABLE,
      });
    });

    getByText('New update available');
    getByText('Bot Framework Composer v1.0.0');
    getByText('Install the update and restart Composer.');
    getByText('Download now and install when you close Composer.');
  });

  it('should render the update unavailable dialog', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        status: AppUpdaterStatus.UPDATE_UNAVAILABLE,
      });
    });

    getByText('No updates available');
    getByText('Composer is up to date.');
  });

  it('should render the update completed dialog', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        status: AppUpdaterStatus.UPDATE_SUCCEEDED,
      });
    });
    getByText('Update complete');
    getByText('Composer will restart.');
  });

  it('should render the update in progress dialog (before total size in known)', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        status: AppUpdaterStatus.UPDATE_IN_PROGRESS,
      });
    });
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('0% of Calculating...');
  });

  it('should render the update in progress dialog', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        progressPercent: 23,
        downloadSizeInBytes: 14760000,
        status: AppUpdaterStatus.UPDATE_IN_PROGRESS,
      });
    });
    getByText('Update in progress');
    getByText('Downloading...');
    getByText('23% of 14.76MB');
  });

  it('should render the error dialog', () => {
    const { getByText } = renderWithRecoil(<AppUpdater />, ({ set }) => {
      set(appUpdateState, {
        ...baseState,
        error: '408 Request timed out.',
        status: AppUpdaterStatus.UPDATE_FAILED,
      });
    });
    getByText('Update failed');
    getByText(`Couldn't complete the update: 408 Request timed out.`);
  });
});
