// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-var-requires no-require-imports

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DemoApp } from 'src/demo/DemoApp';

require('./stylesheet.css');

const rootElement = document.getElementById('root');

const renderApp = () => {
  ReactDOM.render(<DemoApp />, rootElement);
};

renderApp();

// Hot Module Replacement APIs
if (module.hot) {
  module.hot.accept('./DemoApp', () => {
    renderApp();
  });
}
