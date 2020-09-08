// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { mkdirp } from 'fs-extra';
import { app, ipcMain } from 'electron';
import fixPath from 'fix-path';
import { UpdateInfo } from 'electron-updater';
import { AppUpdaterSettings, UserSettings } from '@bfc/shared';

import { isDevelopment } from './utility/env';
import { isWindows, isMac } from './utility/platform';
import { getUnpackedAsarPath } from './utility/getUnpackedAsarPath';
import ElectronWindow from './electronWindow';
import log from './utility/logger';
import { AppUpdater } from './appUpdater';
import { parseDeepLinkUrl } from './utility/url';
import { composerProtocol } from './constants';
import { initAppMenu } from './appMenu';
import { getAccessToken, loginAndGetIdToken, OAuthLoginOptions } from './utility/oauthImplicitFlowHelper';

const error = log.extend('error');
let deeplinkUrl = '';
let serverPort;
// webpack dev server runs on :3000
const getBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3000/';
  }
  if (!serverPort) {
    throw new Error('getBaseUrl() called before serverPort is defined.');
  }
  return `http://localhost:${serverPort}/`;
};

// set production flag
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}
log(`${process.env.NODE_ENV} environment detected.`);

function processArgsForWindows(args: string[]): string {
  const deepLinkUrl = args.find((arg) => arg.startsWith(composerProtocol));
  if (deepLinkUrl) {
    return parseDeepLinkUrl(deepLinkUrl);
  }
  return '';
}

async function createAppDataDir() {
  // TODO: Move all ENV variable setting to an env file and update build process to leverage those variables too
  const appDataBasePath: string = process.env.APPDATA || process.env.HOME || '';
  const compserAppDataDirectoryName = 'BotFrameworkComposer';
  const composerAppDataPath: string = resolve(appDataBasePath, compserAppDataDirectoryName);
  const localPublishPath: string = join(composerAppDataPath, 'hostedBots');
  const azurePublishPath: string = join(composerAppDataPath, 'publishBots');
  process.env.COMPOSER_APP_DATA = join(composerAppDataPath, 'data.json'); // path to the actual data file
  process.env.COMPOSER_EXTENSION_DATA = join(composerAppDataPath, 'extensions.json');
  process.env.COMPOSER_REMOTE_PLUGINS_DIR = join(composerAppDataPath, 'remote-plugins');

  log('creating composer app data path at: ', composerAppDataPath);

  process.env.LOCAL_PUBLISH_PATH = localPublishPath;
  process.env.AZURE_PUBLISH_PATH = azurePublishPath;

  log('creating local bot runtime publish path: ', localPublishPath);
  await mkdirp(localPublishPath);
}

function initializeAppUpdater(settings: AppUpdaterSettings) {
  log('Initializing app updater...');
  const mainWindow = ElectronWindow.getInstance().browserWindow;
  if (mainWindow) {
    const appUpdater = AppUpdater.getInstance();
    appUpdater.setSettings(settings);
    appUpdater.on('update-available', (updateInfo: UpdateInfo) => {
      mainWindow.webContents.send('app-update', 'update-available', updateInfo);
    });
    appUpdater.on('progress', (progress) => {
      mainWindow.webContents.send('app-update', 'progress', progress);
    });
    appUpdater.on('update-not-available', (explicitCheck: boolean) => {
      mainWindow.webContents.send('app-update', 'update-not-available', explicitCheck);
    });
    appUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('app-update', 'update-downloaded');
    });
    appUpdater.on('error', (err) => {
      mainWindow.webContents.send('app-update', 'error', err);
    });
    ipcMain.on('app-update', (_ev, name: string, _payload) => {
      if (name === 'start-download') {
        appUpdater.downloadUpdate();
      }
      if (name === 'install-update') {
        appUpdater.quitAndInstall();
      }
    });
    ipcMain.on('update-user-settings', (_ev, settings: UserSettings) => {
      appUpdater.setSettings(settings.appUpdater);
    });
    app.once('quit', () => {
      if (appUpdater.downloadedUpdate) {
        appUpdater.quitAndInstall();
      }
    });
    appUpdater.checkForUpdates();
  } else {
    throw new Error('Main application window undefined during app updater initialization.');
  }
  log('App updater initialized.');
}

function initAuthListeners(window: Electron.BrowserWindow) {
  ipcMain.on('oauth-start-login', async (_ev, options: OAuthLoginOptions, id: number) => {
    try {
      const idToken = await loginAndGetIdToken(options);
      window.webContents.send('oauth-login-complete', idToken, id);
    } catch (e) {
      window.webContents.send('oauth-login-error', e, id);
    }
  });
  ipcMain.on('oauth-get-access-token', async (_ev, options: OAuthLoginOptions, idToken: string, id: number) => {
    try {
      const accessToken = await getAccessToken({ ...options, idToken });
      window.webContents.send('oauth-get-access-token-complete', accessToken, id);
    } catch (e) {
      window.webContents.send('oauth-get-access-token-error', e, id);
    }
  });
}

async function loadServer() {
  if (!isDevelopment) {
    // only change paths if packaged electron app
    const unpackedDir = getUnpackedAsarPath();
    process.env.COMPOSER_RUNTIME_FOLDER = join(unpackedDir, 'runtime');
    process.env.COMPOSER_BUILTIN_PLUGINS_DIR = join(unpackedDir, 'build', 'plugins');
  }

  // only create a new data directory if packaged electron app
  log('Creating app data directory...');
  await createAppDataDir();
  log('Created app data directory.');

  log('Starting server...');
  const { start } = await import('@bfc/server');
  serverPort = await start();
  log(`Server started at port: ${serverPort}`);
}

async function main() {
  log('Rendering application...');
  const mainWindow = ElectronWindow.getInstance().browserWindow;
  initAppMenu(mainWindow);
  if (mainWindow) {
    if (process.env.COMPOSER_DEV_TOOLS) {
      mainWindow.webContents.openDevTools();
    }
    initAuthListeners(mainWindow);

    if (isWindows()) {
      deeplinkUrl = processArgsForWindows(process.argv);
    }
    await mainWindow.webContents.loadURL(getBaseUrl() + deeplinkUrl);

    mainWindow.show();

    mainWindow.on('closed', () => {
      ElectronWindow.destroy();
    });
    log('Rendered application.');
  }
}

async function run() {
  fixPath(); // required PATH fix for Mac (https://github.com/electron/electron/issues/5626)

  // Force Single Instance Application
  const gotTheLock = app.requestSingleInstanceLock();
  if (gotTheLock) {
    app.on('second-instance', async (e, argv) => {
      if (isWindows()) {
        deeplinkUrl = processArgsForWindows(argv);
      }

      const mainWindow = ElectronWindow.getInstance().browserWindow;
      if (mainWindow) {
        await mainWindow.webContents.loadURL(getBaseUrl() + deeplinkUrl);
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
    ipcMain.once('init-user-settings', (_ev, settings: UserSettings) => {
      // we can't synchronously call the main process (due to deadlocks)
      // so we wait for the initial settings to be loaded from the client
      initializeAppUpdater(settings.appUpdater);
    });
    await loadServer();
    await main();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac()) {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!ElectronWindow.isBrowserWindowCreated) {
      main();
    }
  });

  app.on('will-finish-launching', () => {
    // Protocol handler for osx
    app.on('open-url', (event, url) => {
      event.preventDefault();
      deeplinkUrl = parseDeepLinkUrl(url);
      if (ElectronWindow.isBrowserWindowCreated) {
        const mainWindow = ElectronWindow.getInstance().browserWindow;
        mainWindow?.loadURL(getBaseUrl() + deeplinkUrl);
      }
    });
  });
}

run()
  .catch((e) => {
    error('Error occurred while starting Composer Electron: ', e);
    app.quit();
  })
  .then(() => {
    log('Run completed');
  });
