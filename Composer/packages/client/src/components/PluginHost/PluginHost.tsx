// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React, { useState, useEffect, useRef } from 'react';
import { Shell } from '@botframework-composer/types';
import { PluginType } from '@bfc/extension-client';

import { PluginAPI } from '../../plugins/api';

import { iframeStyle } from './styles';

interface PluginHostProps {
  extraIframeStyles?: SerializedStyles[];
  pluginName: string;
  pluginType: PluginType;
  bundleId: string;
  shell?: Shell;
}

/** Binds closures around Composer client code to plugin iframe's window object */
function attachPluginAPI(win: Window, type: PluginType, shell?: object) {
  const api = { ...PluginAPI[type], ...PluginAPI.auth };

  for (const method in api) {
    win.Composer[method] = (...args) => api[method](...args);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  win.Composer.render = win.Composer.render.bind(null, type, shell);
}

function injectScript(doc: Document, id: string, src: string, async: boolean, onload?: () => any) {
  if (!doc.getElementById(id)) {
    const script = document.createElement('script');
    Object.assign(script, { id, src, async, onload });
    doc.body.appendChild(script);
  }
}

/** Abstraction that will render an iframe injected with all the necessary UI plugin scripts,
 *  and then serve the plugin's client bundle.
 */
export const PluginHost: React.FC<PluginHostProps> = (props) => {
  const targetRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { extraIframeStyles = [], pluginType, pluginName, bundleId, shell } = props;

  useEffect(() => {
    if (isLoaded && pluginType && pluginName && bundleId) {
      const iframeWindow = targetRef.current?.contentWindow as Window;
      const iframeDocument = targetRef.current?.contentDocument as Document;

      attachPluginAPI(iframeWindow, pluginType, shell);

      //load the bundle for the specified plugin
      const pluginScriptId = `plugin-${pluginType}-${pluginName}`;
      const bundleUri = `/api/extensions/${pluginName}/${bundleId}`;
      // If plugin bundles end up being too large and block the client thread due to the load, enable the async flag on this call
      injectScript(iframeDocument, pluginScriptId, bundleUri, false);
    }
  }, [isLoaded]);

  // sync the shell to the iframe store when shell changes
  useEffect(() => {
    if (isLoaded && targetRef.current) {
      targetRef.current.contentWindow?.Composer.sync(shell);
    }
  }, [isLoaded, shell]);

  useEffect(() => {
    // renders the plugin's UI inside of the iframe
    if (pluginName && pluginType) {
      const iframeDocument = targetRef.current?.contentDocument as Document;

      // // load the preload script to setup the plugin API
      injectScript(iframeDocument, 'preload-bundle', '/plugin-host-preload.js', false);

      const onPreloaded = (ev) => {
        if (ev.data === 'host-preload-complete') {
          setIsLoaded(true);
        }
      };

      window.addEventListener('message', onPreloaded);

      return () => {
        window.removeEventListener('message', onPreloaded);
      };
    }
  }, [pluginName, pluginType, bundleId, targetRef]);

  return <iframe ref={targetRef} css={[iframeStyle, ...extraIframeStyles]} title={`${pluginName} host`}></iframe>;
};
