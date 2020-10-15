// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import * as ExtensionClient from '@bfc/extension-client';
import { syncStore, Shell } from '@bfc/extension-client';

if (!document.head.title) {
  const title = document.createElement('title');
  title.innerHTML = 'Plugin Host';
  document.head.append(title);
}

// add default doc styles
if (!document.getElementById('plugin-host-default-styles')) {
  const styles = document.createElement('style');
  styles.id = 'plugin-host-default-styles';
  styles.type = 'text/css';
  styles.appendChild(
    document.createTextNode(`
      html, body { padding: 0; margin: 0; }
      #plugin-root {
        display: flex;
        flex-flow: column nowrap;
        height: 100%;
      }
  `)
  );
  document.head.appendChild(styles);
}
// add the react mount point
if (!document.getElementById('plugin-root')) {
  const root = document.createElement('div');
  root.id = 'plugin-root';
  document.body.appendChild(root);
}
// initialize the API object
window.React = React;
window.ReactDOM = ReactDOM;
window.ExtensionClient = ExtensionClient;
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.Composer = {};

// init the render function
window.Composer.render = function (type: string, shell: Shell, component: React.ReactElement) {
  // eslint-disable-next-line no-underscore-dangle
  window.Composer.__pluginType = type;

  if (shell) {
    syncStore(shell);
  }

  ReactDOM.render(component, document.getElementById('plugin-root'));
};

window.Composer.sync = function (shell: Shell) {
  syncStore(shell);
};

window.parent?.postMessage('host-preload-complete', '*');
