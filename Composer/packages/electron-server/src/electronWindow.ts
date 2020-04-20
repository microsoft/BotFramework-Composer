// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
//

import { join } from 'path';

import { app, BrowserWindow, screen } from 'electron';

import { isDevelopment } from './utility/env';
import { getUnpackedAsarPath } from './utility/getUnpackedAsarPath';

export default class ElectronWindow {
  private static instance: ElectronWindow | undefined;
  private _currentBrowserWindow: BrowserWindow;

  get browserWindow(): BrowserWindow | undefined {
    if (ElectronWindow.instance) {
      return ElectronWindow.instance._currentBrowserWindow;
    }
  }

  private constructor() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
      width: width * 0.75,
      height: height * 0.9,
      webPreferences: {
        nodeIntegration: false,
        preload: join(__dirname, 'preload.js'),
      },
      show: false,
      title: `Bot Framework Composer (v${app.getVersion()})`,
    };
    if (process.platform === 'linux' && !isDevelopment) {
      // workaround for broken .AppImage icons since electron-builder@21.0.1 removed .AppImage desktop integration
      // (https://github.com/electron-userland/electron-builder/releases/tag/v21.0.1)
      browserWindowOptions.icon = join(getUnpackedAsarPath(), 'resources/composerIcon_1024x1024.png');
    }
    this._currentBrowserWindow = new BrowserWindow(browserWindowOptions);
    this._currentBrowserWindow.on('page-title-updated', ev => ev.preventDefault());
  }

  public static destroy() {
    ElectronWindow.instance = undefined;
  }

  public static get isBrowserWindowCreated() {
    return !!ElectronWindow.instance;
  }

  public static getInstance(): ElectronWindow {
    if (!ElectronWindow.instance) {
      ElectronWindow.instance = new ElectronWindow();
    }
    return ElectronWindow.instance;
  }
}
