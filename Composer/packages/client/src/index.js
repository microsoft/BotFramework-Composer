import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';

import './index.css';
import { App } from './App';
import { ShellApi } from './ShellApi';
import * as serviceWorker from './serviceWorker';
import { StoreProvider } from './store';

formatMessage.setup({
  missingTranslation: 'ignore',
});

ReactDOM.render(
  <StoreProvider>
    <Fragment>
      <App />
      <ShellApi />
    </Fragment>
  </StoreProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
