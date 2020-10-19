// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React, { useEffect, useRef } from 'react';
import { Shell } from '@botframework-composer/types';
import { PluginType } from '@bfc/extension-client';

import { PluginAPI } from '../../plugins/api';

export const iframeStyle = css`
  height: 100%;
  width: 100%;
  border: 0;
`;

interface PluginHostProps {
  extraIframeStyles?: SerializedStyles[];
  pluginName: string;
  pluginType: PluginType;
  bundleId: string;
  shell?: Shell;
}

function resetIframe(iframeDoc: Document) {
  iframeDoc.head.innerHTML = '';
  iframeDoc.body.innerHTML = '';
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
  const { extraIframeStyles = [], pluginType, pluginName, bundleId, shell } = props;

  const loadBundle = (name: string, bundle: string, type: PluginType) => {
    const iframeWindow = targetRef.current?.contentWindow as Window;
    const iframeDocument = targetRef.current?.contentDocument as Document;

    attachPluginAPI(iframeWindow, type, shell);

    //load the bundle for the specified plugin
    const pluginScriptId = `plugin-${type}-${name}`;
    const bundleUri = `/api/extensions/${name}/${bundle}`;
    // If plugin bundles end up being too large and block the client thread due to the load, enable the async flag on this call
    injectScript(iframeDocument, pluginScriptId, bundleUri, false);
  };

  useEffect(() => {
    // renders the plugin's UI inside of the iframe
    if (pluginName && pluginType && targetRef.current) {
      const iframeDocument = targetRef.current.contentDocument as Document;

      // cleanup
      resetIframe(iframeDocument);

      // load the preload script to setup the plugin API
      injectScript(iframeDocument, 'preload-bundle', '/plugin-host-preload.js', false);

      const onPreloaded = (ev) => {
        if (ev.data === 'host-preload-complete') {
          loadBundle(pluginName, bundleId, pluginType);
        }
      };

      window.addEventListener('message', onPreloaded);

      return () => {
        window.removeEventListener('message', onPreloaded);
      };
    }
  }, [pluginName, pluginType, bundleId]);

  // sync the shell to the iframe store when shell changes
  useEffect(() => {
    const frameApi = targetRef.current?.contentWindow?.Composer;
    if (frameApi && typeof frameApi.sync === 'function') {
      frameApi.sync(shell);
    }
  }, [shell]);

  return <iframe ref={targetRef} css={[iframeStyle, ...extraIframeStyles]} title={`${pluginName} host`} />;
};
