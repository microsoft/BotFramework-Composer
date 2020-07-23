// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { RecoilRoot } from 'recoil';

import './index.css';
import { App } from './App';
import { DispatcherWrapper } from './recoilModel';

const appHostElm = document.getElementById('root');

formatMessage.setup({
  missingTranslation: process.env.NODE_ENV === 'development' ? 'warning' : 'ignore',
});

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
