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
    const { height, width } = screen.getPrimaryDisplay().workAreaSize;
    console.log(`Raw screen dimensions: ${height} x ${width}`);
    const adjustedHeight = Math.floor(height * 0.9); // take up 90% of screen height
    const adjustedWidth = Math.floor((4 / 3) * adjustedHeight); // snap to 4:3 aspect ratio (16:9 doesn't look as good when scaled down)
    console.log(`Electron window dimensions: ${adjustedHeight} x ${adjustedWidth}`);
    const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
      width: adjustedWidth,
      height: adjustedHeight,
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
    this._currentBrowserWindow.on('page-title-updated', ev => ev.preventDefault()); // preserve explicit window title
    console.log('Rendered Electron window dimensions: ', this._currentBrowserWindow.getSize());
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
