// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';

window.React = React;

// load plugin bundle

console.log('loading plugin container!');

async function loadPlugins() {
  const res = await fetch('/api/plugins');
  const plugins = await res.json();
  const allLoaded: Promise<any>[] = [];

  plugins.forEach((plugin) => {
    if (plugin.bundles && Array.isArray(plugin.bundles)) {
      plugin.bundles.forEach((bundle) => {
        const loaded = new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = `/api/plugins/${plugin.id}/bundles/${bundle.id}`;
          script.async = true;
          const onLoad = () => resolve();
          script.onload = onLoad;

          console.log(`appending script to body: /api/plugins/${plugin.id}/bundles/${bundle.id}`);
          document.body.append(script);
        });
        allLoaded.push(loaded);
      });
    }
  });
}

(window as any).ComposerPlugins = [];

loadPlugins().then(() => {
  setTimeout(() => {
    console.log('plugins loaded', (window as any).ComposerPlugins);
    (window as any).ComposerPlugins.forEach((p) => {
      console.log(`Initializing ${p.name}`);
      const container = document.createElement('div');
      container.id = `plugin-${p.name}`;
      document.body.append(container);

      const render = (component) => {
        ReactDOM.render(component, container);
      };

      p.initialize({ render });
    });
  }, 2000);
});
