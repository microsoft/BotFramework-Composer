import React from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';
import './index.css';

import { App } from './App';
import { ShellApi } from './ShellApi';
import { StoreProvider } from './store';

formatMessage.setup({
  missingTranslation: 'ignore',
});

ReactDOM.render(
  <StoreProvider>
    <App />
    <ShellApi />
  </StoreProvider>,
  document.getElementById('root')
);
