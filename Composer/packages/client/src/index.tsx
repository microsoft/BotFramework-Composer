// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import './index.css';

import { App } from './App';
import { StoreProvider } from './store';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

ReactDOM.render(
  <CacheProvider value={emotionCache}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </CacheProvider>,
  document.getElementById('root')
);
