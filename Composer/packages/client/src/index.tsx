import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';
import './index.css';

import { App } from './App';
import { ShellApi } from './ShellApi';
import { StoreProvider } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';
import Webchat from './pages//webchat/MinimizableWebchat';

formatMessage.setup({
  missingTranslation: 'ignore',
});

ReactDOM.render(
  <StoreProvider>
    <ErrorBoundary>
      <Fragment>
        <App />
        <ShellApi />
      </Fragment>
    </ErrorBoundary>
    <Webchat token={(window as any).webchatToken} bearer={(window as any).bearerToken} />
  </StoreProvider>,
  document.getElementById('root')
);
