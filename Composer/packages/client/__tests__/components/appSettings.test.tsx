// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { AppSettings } from '../../src/pages/setting/app-settings/AppSettings';
import { ElectronSettings } from '../../src/pages/setting/app-settings/electronSettings';
import { renderWithStore } from '../testUtils';

describe('<AppSettings /> & <ElectronSettings />', () => {
  let state;
  beforeEach(() => {
    window.__IS_ELECTRON__ = undefined;
    state = {
      onboarding: { complete: false },
      userSettings: {
        appUpdater: {
          autoDownload: false,
          useNightly: true,
        },
        codeEditor: {
          lineNumbers: false,
          wordWrap: false,
          minimap: false,
        },
        propertyEditorWidth: 400,
        dialogNavWidth: 180,
      },
    };
  });

  afterAll(() => {
    window.__IS_ELECTRON__ = undefined;
  });

  it('should render the user settings page', () => {
    const { getByText, getAllByText } = renderWithStore(<AppSettings />, state);
    // there are 2 onboarding texts
    getAllByText('Onboarding');
    getByText('Property editor preferences');
    expect(() => getByText('Application Updates')).toThrow();
  });

  it('should render the electron settings section', () => {
    const { getByText } = renderWithStore(<ElectronSettings />, state);
    getByText('Application Updates');
    getByText('Auto update');
    getByText('Early adopters');
  });
});
