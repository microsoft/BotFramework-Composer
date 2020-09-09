// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import * as React from 'react';
import { useEffect, useRef } from 'react';

import { PluginAPI } from '../../plugins/api';
import { PluginType } from '../../plugins/types';

import { iframeStyle } from './styles';

interface PluginHostProps {
  extraIframeStyles?: SerializedStyles[];
  pluginName?: string;
  pluginType?: PluginType;
}

/** Binds closures around Composer client code to plugin iframe's window object */
function attachPluginAPI(win: Window, type: PluginType) {
  const api = { ...PluginAPI[type], ...PluginAPI.auth };
  for (const method in api) {
    win.Composer[method] = (...args) => api[method](...args);
  }
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
  const { extraIframeStyles = [] } = props;

  useEffect(() => {
    const { pluginName, pluginType } = props;
    // renders the plugin's UI inside of the iframe
    const renderPluginView = async () => {
      if (pluginName && pluginType) {
        const iframeWindow = targetRef.current?.contentWindow as Window;
        const iframeDocument = targetRef.current?.contentDocument as Document;

        // inject the react / react-dom bundles
        injectScript(iframeDocument, 'react-bundle', '/react-bundle.js', false);
        injectScript(iframeDocument, 'react-dom-bundle', '/react-dom-bundle.js', false);
        // // load the preload script to setup the plugin API
        injectScript(iframeDocument, 'preload-bundle', '/plugin-host-preload.js', false, () => {
          attachPluginAPI(iframeWindow, pluginType);
        });

        //load the bundle for the specified plugin
        const pluginScriptId = `plugin-${pluginType}-${pluginName}`;
        await new Promise((resolve) => {
          const cb = () => {
            resolve();
          };
          // If plugin bundles end up being too large and block the client thread due to the load, enable the async flag on this call
          injectScript(iframeDocument, pluginScriptId, `/api/plugins/${pluginName}/view/${pluginType}`, false, cb);
        });
      }
    };
    renderPluginView();
  }, [props.pluginName, props.pluginType, targetRef]);

  return <iframe ref={targetRef} css={[iframeStyle, ...extraIframeStyles]} title={`${props.pluginName} host`}></iframe>;
};
