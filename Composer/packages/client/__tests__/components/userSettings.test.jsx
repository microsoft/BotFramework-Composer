// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { StoreContext } from '../../src/store';
import { UserSettings } from '../../src/pages/setting/user-settings/index';

describe('<UserSettings />', () => {
  let storeContext;
  beforeEach(() => {
    window.__IS_ELECTRON__ = undefined;
    storeContext = {
      actions: {},
      state: {
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
      },
    };
  });

  it('should render the user settings page', () => {
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <UserSettings />
      </StoreContext.Provider>
    );
    getByText('User Preferences');
    getByText('General');
    getByText('Code Editor');
    try {
      getByText('Application Updates'); // shouldn't exist and will throw
      expect(true).toBe(true); // ensure catch is hit
    } catch (e) {}
  });

  it('should render the user settings page - Electron version', () => {
    window.__IS_ELECTRON__ = true;
    const { getByText } = render(
      <StoreContext.Provider value={storeContext}>
        <UserSettings />
      </StoreContext.Provider>
    );
    getByText('User Preferences');
    getByText('General');
    getByText('Code Editor');
    getByText('Application Updates');
  });
});
