// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { mkdirp } from 'fs-extra';
import { app, ipcMain } from 'electron';
import fixPath from 'fix-path';
import { UpdateInfo } from 'electron-updater';

import { isDevelopment } from './utility/env';
import { isWindows } from './utility/platform';
import { getUnpackedAsarPath } from './utility/getUnpackedAsarPath';
import ElectronWindow from './electronWindow';
import log from './utility/logger';
import { AppUpdater } from './appUpdater';
import { parseDeepLinkUrl } from './utility/url';
import { composerProtocol } from './constants';

const error = log.extend('error');
const baseUrl = isDevelopment ? 'http://localhost:3000/' : 'http://localhost:5000/';
let deeplinkingUrl = '';

function processArgsForWindows(args: string[]): string {
  const deepLinkUrl = args.find(arg => arg.startsWith(composerProtocol));
  if (deepLinkUrl) {
    return parseDeepLinkUrl(deepLinkUrl);
  }
  return '';
}

async function createAppDataDir() {
  const appDataBasePath: string = process.env.APPDATA || process.env.HOME || '';
  const compserAppDataDirectoryName = 'BotFrameworkComposer';
  const composerAppDataPath: string = resolve(appDataBasePath, compserAppDataDirectoryName);
  process.env.COMPOSER_APP_DATA = join(composerAppDataPath, 'data.json'); // path to the actual data file
  log('creating composer app data path at: ', composerAppDataPath);
  await mkdirp(composerAppDataPath);
}

function initializeAppUpdater() {
  log('Initializing app updater...');
  const mainWindow = ElectronWindow.getInstance().browserWindow;
  if (mainWindow) {
    const appUpdater = new AppUpdater();
    appUpdater.on('update-available', (updateInfo: UpdateInfo) => {
      // TODO: if auto/silent download is enabled in settings, don't send this event.
      // instead, just download silently
      mainWindow.webContents.send('app-update', 'update-available', updateInfo);
    });
    appUpdater.on('progress', progress => {
      mainWindow.webContents.send('app-update', 'progress', progress);
    });
    appUpdater.on('update-not-available', () => {
      mainWindow.webContents.send('app-update', 'update-not-available');
    });
    appUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('app-update', 'update-downloaded');
    });
    appUpdater.on('error', err => {
      mainWindow.webContents.send('app-update', 'error', err);
    });
    ipcMain.on('app-update', (_ev, name, payload) => {
      if (name === 'start-download') {
        appUpdater.downloadUpdate();
      }
      if (name === 'install-update') {
        appUpdater.quitAndInstall();
      }
    });
    appUpdater.checkForUpdates();
  } else {
    throw new Error('Main application window undefined during app updater initialization.');
  }
  log('App updater initialized.');
}

async function loadServer() {
  let pluginsDir = ''; // let this be assigned by start() if in development
  if (!isDevelopment) {
    // only change paths if packaged electron app
    const unpackedDir = getUnpackedAsarPath();
    process.env.COMPOSER_RUNTIME_FOLDER = join(unpackedDir, 'build', 'templates');
    pluginsDir = join(unpackedDir, 'build', 'plugins');
  }

  // only create a new data directory if packaged electron app
  log('Creating app data directory...');
  await createAppDataDir();
  log('Created app data directory.');

  log('Starting server...');
  const { start } = await import('@bfc/server');
  await start(pluginsDir);
  log('Server started. Rendering application...');
}

async function main() {
  const mainWindow = ElectronWindow.getInstance().browserWindow;
  if (mainWindow) {
    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
    }

    if (isWindows()) {
      deeplinkingUrl = processArgsForWindows(process.argv);
    }
    await mainWindow.webContents.loadURL(baseUrl + deeplinkingUrl);

    mainWindow.show();

    mainWindow.on('closed', function() {
      ElectronWindow.destroy();
    });
  }
}

async function run() {
  fixPath(); // required PATH fix for Mac (https://github.com/electron/electron/issues/5626)

  // Force Single Instance Application
  const gotTheLock = app.requestSingleInstanceLock();
  if (gotTheLock) {
    app.on('second-instance', async (e, argv) => {
      if (isWindows()) {
        deeplinkingUrl = processArgsForWindows(argv);
      }

      const mainWindow = ElectronWindow.getInstance().browserWindow;
      if (mainWindow) {
        await mainWindow.webContents.loadURL(baseUrl + deeplinkingUrl);
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  } else {
    app.quit();
  }

  app.on('ready', async () => {
    log('App ready');
    await loadServer();
    log('Server has been loaded');
    await main();
    initializeAppUpdater();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!ElectronWindow.isBrowserWindowCreated) {
      main();
    }
  });

  app.on('will-finish-launching', function() {
    // Protocol handler for osx
    app.on('open-url', (event, url) => {
      event.preventDefault();
      deeplinkingUrl = parseDeepLinkUrl(url);
      if (ElectronWindow.isBrowserWindowCreated) {
        const mainWindow = ElectronWindow.getInstance().browserWindow;
        mainWindow?.loadURL(baseUrl + deeplinkingUrl);
      }
    });
  });
}

run()
  .catch(e => {
    error('Error occurred while starting Composer Electron: ', e);
    app.quit();
  })
  .then(() => {
    log('Run completed');
  });
