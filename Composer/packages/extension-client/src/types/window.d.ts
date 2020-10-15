// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Shell } from '@bfc/types';

import * as ExtensionClient from '../index';

declare global {
  interface Window {
    /**
     * Electron mechanism used for communication from renderer to main process.
     */
    ipcRenderer: IPCRenderer;

    /**
     * Flag that is set on the window object when the client is embedded within Electron.
     */
    __IS_ELECTRON__?: boolean;

    /**
     * Composer UI Extension API
     */
    Composer: {
      __pluginType: string;
      render: (component: React.ReactElement) => void;
      sync: (shell: Shell) => void;
      [key: string]: any;
    };

    ExtensionClient: typeof ExtensionClient;
  }
}
