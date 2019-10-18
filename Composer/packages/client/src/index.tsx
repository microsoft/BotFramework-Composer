import React from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import './index.css';

import { App } from './App';
import { ShellApi } from './ShellApi';
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
      <ShellApi />
    </StoreProvider>
  </CacheProvider>,
  document.getElementById('root')
);
