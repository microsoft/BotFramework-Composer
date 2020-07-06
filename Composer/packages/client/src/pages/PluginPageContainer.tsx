// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { RouteComponentProps } from '@reach/router';

import { useStoreContext } from '../hooks/useStoreContext';
import { Plugin } from '../store/types';

async function loadPage(pluginId: string, pageId: string) {}

declare global {
  interface Window {
    ComposerPlugins: any[];
  }
}

const PluginPageContainer: React.FC<RouteComponentProps<{ pluginId: string; pluginPage: string }>> = (props) => {
  const { pluginId, pluginPage } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log(window.ComposerPlugins);
    if (pluginId && pluginPage && window.ComposerPlugins) {
      const plugin = window.ComposerPlugins.find((p) => p.name === pluginPage);

      if (plugin && containerRef.current) {
        const render = (component) => {
          ReactDOM.render(component, containerRef.current);
        };

        plugin?.initialize({ render });
      }
    }
  }, [pluginId, pluginPage, containerRef.current]);

  return <div ref={containerRef} />;
};

export { PluginPageContainer };
