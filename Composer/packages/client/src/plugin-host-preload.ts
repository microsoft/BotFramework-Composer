// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @bfc/bfcomposer/office-ui-import-scope
import * as Fabric from 'office-ui-fabric-react';
import * as ExtensionClient from '@bfc/extension-client';
import * as CodeEditors from '@bfc/code-editor';
import * as UIShared from '@bfc/ui-shared';
import { syncStore, Shell } from '@bfc/extension-client';

import './index.css';

Fabric.initializeIcons(undefined, { disableWarnings: true });

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
if (!document.getElementById('root')) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}
// initialize the API object
window.React = React;
window.ReactDOM = ReactDOM;
window.ExtensionClient = ExtensionClient;
window.Fabric = Fabric;
window.CodeEditors = CodeEditors;
window.UIShared = UIShared;
window.Composer = {
  __extensionId: '',
  __bundleId: '',
  __pluginType: '',
  render: (component: React.ReactElement) => {
    ReactDOM.render(component, document.getElementById('root'));
    window.parent?.postMessage('plugin-rendered', '*');
  },
  sync: (shell: Shell) => {
    syncStore(shell);
  },
  settings: {},
};

// signal to the host that we are ready to accept the plugin bundle
window.parent?.postMessage('host-preload-complete', '*');
