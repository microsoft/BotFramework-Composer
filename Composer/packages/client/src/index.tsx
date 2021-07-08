// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { RecoilRoot } from 'recoil';
import { IpcEvents } from '@bfc/shared';

import './index.css';

import { App } from './App';
import { DispatcherWrapper } from './recoilModel';
import { appCleanupManager } from './utils/appCleanupManager';

// clean up tasks
const { ipcRenderer } = window;
const AppCleanupTimeLimit = 1000 * 30; // 30 seconds
ipcRenderer?.on(IpcEvents.StartAppCleanup, async () => {
  try {
    // force shutdown if cleaning up takes too long
    setTimeout(() => ipcRenderer?.send(IpcEvents.FinishedAppCleanup), AppCleanupTimeLimit);
    await appCleanupManager.cleanUpTasks();
  } catch (e) {
    // ...
  } finally {
    ipcRenderer?.send(IpcEvents.FinishedAppCleanup);
  }
});
const appHostElm = document.getElementById('root');

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

/**
 * Renders the React App module.
 */
const renderApp = (AppComponent: typeof App) => {
  ReactDOM.render(
    <RecoilRoot>
      <CacheProvider value={emotionCache}>
        <DispatcherWrapper>
          <AppComponent />
        </DispatcherWrapper>
      </CacheProvider>
    </RecoilRoot>,
    appHostElm
  );
};

// Rendering the App for the first time.
renderApp(App);

/**
 * Re-render updated App Module when hot module notifies a change.
 */
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require<{ App: typeof App }>('./App').App;
    renderApp(NextApp);
  });
}
