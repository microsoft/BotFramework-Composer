// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { RecoilRoot } from 'recoil';

import './index.css';

import { App } from './App';
import { DispatcherWrapper } from './recoilModel';

const appHostElm = document.getElementById('root');

const emotionCache = createCache({
  key: 'client-cache',
  // @ts-expect-error nonce is defined during initial page rendering
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
    appHostElm,
  );
};

// Rendering the App for the first time.
renderApp(App);

/**
 * Re-render updated App Module when hot module notifies a change.
 */
if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextApp = require<{ App: typeof App }>('./App').App;
    renderApp(NextApp);
  });
}
