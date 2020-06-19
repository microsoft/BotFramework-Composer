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
import { StoreProvider } from './store';
import { DispatcherWraper } from './recoilModel/dispatchers/DispatcherWraper';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

ReactDOM.render(
  <RecoilRoot>
    <DispatcherWraper />
    <CacheProvider value={emotionCache}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </CacheProvider>
  </RecoilRoot>,
  document.getElementById('root')
);
