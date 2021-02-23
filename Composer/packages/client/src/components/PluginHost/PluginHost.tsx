// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useRef } from 'react';
import { Shell, ExtensionSettings } from '@botframework-composer/types';
import { PluginType } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';

import { LoadingSpinner } from '../LoadingSpinner';
import { PluginAPI } from '../../plugins/api';
import { extensionSettingsState } from '../../recoilModel';

const containerStyles = css`
  position: relative;
  height: 100%;
  width: 100%;
`;

const iframeStyle = (isLoading = false) => css`
  height: 100%;
  width: 100%;
  border: 0;
  display: ${isLoading ? 'none' : 'block'};
`;

const loadingStyles = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface PluginHostProps {
  pluginName: string;
  pluginType: PluginType;
  bundleId: string;
  shell?: Shell;
}

/** Binds closures around Composer client code to plugin iframe's window object */
async function attachPluginAPI(
  win: Window,
  id: string,
  type: PluginType,
  shell?: object,
  settings?: ExtensionSettings
) {
  const api = { ...PluginAPI[type], ...PluginAPI.auth };

  for (const method in api) {
    win.Composer[method] = (...args) => api[method](...args);
  }

  win.Composer.__extensionId = id;
  win.Composer.__pluginType = type;
  win.Composer.settings = settings ?? {};
  win.Composer.sync(shell);
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
  const { pluginType, pluginName, bundleId, shell } = props;
  const [isLoading, setIsLoading] = useState(true);
  const extensionSettings = useRecoilValue(extensionSettingsState);

  useEffect(() => {
    const isReady = (ev) => {
      if (ev.data === 'plugin-rendered') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', isReady);

    return () => {
      window.removeEventListener('message', isReady);
    };
  }, []);

  const loadBundle = async (name: string, bundle: string, type: PluginType) => {
    const iframeWindow = targetRef.current?.contentWindow as Window;
    const iframeDocument = targetRef.current?.contentDocument as Document;

    await attachPluginAPI(iframeWindow, name, type, shell, extensionSettings);

    //load the bundle for the specified plugin
    const pluginScriptId = `plugin-${type}-${name}`;
    const bundleUri = `/api/extensions/${name}/${bundle}`;
    // If plugin bundles end up being too large and block the client thread due to the load, enable the async flag on this call
    injectScript(iframeDocument, pluginScriptId, bundleUri, false);
  };

  useEffect(() => {
    // renders the plugin's UI inside of the iframe
    if (pluginName && pluginType && targetRef.current) {
      setIsLoading(true);
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

  return (
    <div css={containerStyles}>
      <iframe
        key={`${pluginName}.${bundleId}.${pluginType}`}
        ref={targetRef}
        css={iframeStyle(isLoading)}
        src="/plugin-host.html"
        title={`${pluginName} host`}
      />
      {isLoading && (
        <div css={loadingStyles}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};
