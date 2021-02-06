// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { AppSettings } from '../../src/pages/setting/app-settings/AppSettings';
import { ElectronSettings } from '../../src/pages/setting/app-settings/electronSettings';
import { renderWithRecoil } from '../testUtils';
import { onboardingState, userSettingsState } from '../../src/recoilModel';

describe('<AppSettings /> & <ElectronSettings />', () => {
  beforeEach(() => {
    window.__IS_ELECTRON__ = undefined;
  });

  afterAll(() => {
    window.__IS_ELECTRON__ = undefined;
  });

  it('should render the user settings page', () => {
    const { getByText, getAllByText } = renderWithRecoil(<AppSettings />, ({ set }) => {
      set(onboardingState, {
        coachMarkRefs: {},
        complete: false,
      });
    });
    // there are 2 onboarding texts
    getAllByText('Onboarding');
    getByText('Property editor preferences');
    getByText('Application Updates');
  });

  it('should render the electron settings section', () => {
    const { getByText } = renderWithRecoil(<ElectronSettings />, ({ set }) => {
      set(userSettingsState, {
        appUpdater: {
          autoDownload: false,
          useNightly: true,
        },
        codeEditor: {
          lineNumbers: false,
          wordWrap: false,
          minimap: false,
          fontSettings: {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: '400',
          },
        },
        propertyEditorWidth: 400,
        dialogNavWidth: 180,
        appLocale: 'en-US',
        telemetry: {},
      });
    });
    getByText('Auto update');
    getByText('Early adopters');
  });
});
