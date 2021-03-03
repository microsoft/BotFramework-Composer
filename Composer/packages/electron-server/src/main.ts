// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { AppUpdaterSettings, UserSettings } from '@bfc/shared';
import { app, ipcMain } from 'electron';
import { UpdateInfo } from 'electron-updater';
import fixPath from 'fix-path';
import formatMessage from 'format-message';
import { mkdirp } from 'fs-extra';

import { initAppMenu } from './appMenu';
import { AppUpdater } from './appUpdater';
import { OneAuthService } from './auth/oneAuthService';
import { composerProtocol } from './constants';
import ElectronWindow from './electronWindow';
import { initSplashScreen } from './splash/splashScreen';
import { isDevelopment } from './utility/env';
import { getUnpackedAsarPath } from './utility/getUnpackedAsarPath';
import { getAppLocale, loadLocale, updateAppLocale } from './utility/locale';
import log from './utility/logger';
import { isLinux, isMac, isWindows } from './utility/platform';
import { parseDeepLinkUrl } from './utility/url';
import { getMachineId } from './utility/machineId';
import { getSessionId } from './utility/sessionId';

const env = log.extend('env');
env('%O', process.env);

const microsoftLogoPath = join(__dirname, '../resources/ms_logo.svg');
let currentAppLocale = getAppLocale().appLocale;

const error = log.extend('error');
let serverPort;
let signalThatMainWindowIsShowing;
const waitForMainWindowToShow = new Promise((resolve) => {
  signalThatMainWindowIsShowing = resolve;
});

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
  // Windows and Mac use the window title as the app name, but some linux distributions use package name, this will fix that.
  if (isLinux()) {
    app.setName('Bot Framework Composer');
  }
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
  process.env.TEMPLATE_GENERATOR_PATH = join(composerAppDataPath, '.yo-repository');
  process.env.COMPOSER_EXTENSION_MANIFEST = join(composerAppDataPath, 'extensions.json');
  process.env.COMPOSER_EXTENSION_SETTINGS = join(composerAppDataPath, 'extension-settings.json');
  process.env.COMPOSER_EXTENSION_DATA_DIR = join(composerAppDataPath, 'extension-data');
  process.env.COMPOSER_REMOTE_EXTENSIONS_DIR = join(composerAppDataPath, 'extensions');
  process.env.COMPOSER_TEMP_DIR = join(composerAppDataPath, 'temp');
  process.env.COMPOSER_BACKUP_DIR = join(composerAppDataPath, 'backup');

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
    appUpdater.on('update-in-progress', (updateInfo: UpdateInfo) => {
      mainWindow.webContents.send('app-update', 'update-in-progress', updateInfo);
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
    ipcMain.on('update-user-settings', async (_ev, settings: UserSettings) => {
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

async function loadServer() {
  if (!isDevelopment) {
    // only change paths if packaged electron app
    const unpackedDir = getUnpackedAsarPath();
    process.env.COMPOSER_RUNTIME_FOLDER = join(unpackedDir, 'runtime');
    process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR = join(unpackedDir, 'extensions');
    process.env.COMPOSER_FORM_DIALOG_TEMPLATES_DIR = join(unpackedDir, 'form-dialog-templates');
  }

  const machineId = await getMachineId();
  const sessionId = getSessionId();

  // only create a new data directory if packaged electron app
  log('Creating app data directory...');
  await createAppDataDir();
  log('Created app data directory.');

  log('Starting server...');
  const { start } = await import('@bfc/server');
  serverPort = await start({
    getAccessToken: OneAuthService.getAccessToken.bind(OneAuthService),
    getARMTokenForTenant: OneAuthService.getARMTokenForTenant.bind(OneAuthService),
    getTenants: OneAuthService.getTenants.bind(OneAuthService),
    logOut: OneAuthService.signOut.bind(OneAuthService),
    machineId,
    sessionId,
    composerVersion: app.getVersion(),
  });
  log(`Server started at port: ${serverPort}`);
}

async function main(show = false) {
  log('Rendering application...');
  const mainWindow = ElectronWindow.getInstance().browserWindow;
  initAppMenu(mainWindow);
  if (mainWindow) {
    if (process.env.COMPOSER_DEV_TOOLS) {
      mainWindow.webContents.openDevTools();
    }

    await mainWindow.loadURL(getBaseUrl());

    if (show) {
      mainWindow.show();
    }

    if (isWindows()) {
      // wait until the main window is showing and then open deep links
      waitForMainWindowToShow
        .then(async () => {
          log('[Windows] Main window is now showing. Processing deep link if any.');
          const deeplinkUrl = processArgsForWindows(process.argv);
          if (deeplinkUrl) {
            log('[Windows] Loading deeplink: %s', deeplinkUrl);
            await mainWindow.webContents.loadURL(getBaseUrl() + deeplinkUrl);
          }
        })
        .catch((e) =>
          console.error('[Windows] Error while waiting for main window to show before processing deep link: ', e)
        );
    }

    mainWindow.on('closed', () => {
      ElectronWindow.destroy();
    });
    log('Rendered application.');
  }
}

const checkAppLocale = (newAppLocale: string) => {
  // If the app locale changes, load the new locale, re-create the menu and persist the new value.
  if (currentAppLocale !== newAppLocale) {
    log('Reloading locale');
    loadLocale(newAppLocale);
    initAppMenu(ElectronWindow.getInstance().browserWindow);

    updateAppLocale(newAppLocale);
    currentAppLocale = newAppLocale;
  }
};

const initSettingsListeners = () => {
  ipcMain.once('init-user-settings', (_ev, settings: UserSettings) => {
    // Check app locale for changes
    checkAppLocale(settings.appLocale);
    // we can't synchronously call the main process (due to deadlocks)
    // so we wait for the initial settings to be loaded from the client
    initializeAppUpdater(settings.appUpdater);
  });

  ipcMain.on('update-user-settings', (_ev, settings: UserSettings) => {
    checkAppLocale(settings.appLocale);
  });
};

async function run() {
  fixPath(); // required PATH fix for Mac (https://github.com/electron/electron/issues/5626)

  // Force Single Instance Application
  const gotTheLock = app.requestSingleInstanceLock();
  if (gotTheLock) {
    app.on('second-instance', async (e, argv) => {
      let deeplinkUrl = '';
      if (isWindows()) {
        deeplinkUrl = processArgsForWindows(argv);
        log('[Windows] Loading deeplink: %s', deeplinkUrl);
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

    log('Loading latest known locale');
    loadLocale(currentAppLocale);

    const getMainWindow = () => ElectronWindow.getInstance().browserWindow;
    const { startApp, updateStatus } = await initSplashScreen({
      getMainWindow,
      icon: join(__dirname, '../resources/composerIcon_1024x1024.png'),
      color: 'rgb(0, 120, 212)',
      logo: `file://${microsoftLogoPath}`,
      productName: 'Bot Framework Composer',
      productFamily: 'Microsoft Azure',
      status: formatMessage('Initializing...'),
      website: 'www.botframework.com',
      width: 500,
      height: 300,
    });

    updateStatus(formatMessage('Starting server...'));
    await loadServer();

    initSettingsListeners();
    await main();

    setTimeout(() => startApp(signalThatMainWindowIsShowing), 500);

    const mainWindow = getMainWindow();
    mainWindow?.webContents.send('session-update', 'session-started');
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac()) {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    const mainWindow = ElectronWindow.getInstance().browserWindow;
    mainWindow?.webContents.send('session-update', 'session-ended');
    mainWindow?.webContents.send('conversation-cleanup');
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!ElectronWindow.isBrowserWindowCreated) {
      main(true);
    }
  });

  app.on('will-finish-launching', () => {
    // Protocol handler for osx
    app.on('open-url', (event, url) => {
      event.preventDefault();
      if (ElectronWindow.isBrowserWindowCreated) {
        waitForMainWindowToShow
          .then(() => {
            log('[Mac] Main window is now showing. Processing deep link if any.');
            const deeplinkUrl = parseDeepLinkUrl(url);
            log('[Mac] Loading deeplink: %s', deeplinkUrl);
            const mainWindow = ElectronWindow.getInstance().browserWindow;
            mainWindow?.loadURL(getBaseUrl() + deeplinkUrl);
          })
          .catch((e) =>
            console.error('[Mac] Error while waiting for main window to show before processing deep link: ', e)
          );
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
