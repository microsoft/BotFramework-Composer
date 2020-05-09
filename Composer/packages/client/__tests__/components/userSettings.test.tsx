// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { UserSettings } from '../../src/pages/setting/user-settings/index';
import { ElectronSettings } from '../../src/pages/setting/user-settings/electronSettings';
import { renderWithStore } from '../testUtils';

describe('<UserSettings /> & <ElectronSettings />', () => {
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
    const { getByText } = renderWithStore(<UserSettings />, state);
    getByText('User Preferences');
    getByText('General');
    getByText('Code Editor');
    expect(() => getByText('Application Updates')).toThrow();
  });

  it('should render the electron settings section', () => {
    const { getByText } = renderWithStore(<ElectronSettings />, state);
    getByText('Application Updates');
    getByText('Automatically download and install updates');
    getByText('Use nightly builds');
  });
});
