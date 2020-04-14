// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { mkdirp } from 'fs-extra';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import fixPath from 'fix-path';

import { getUnpackedAsarPath } from './utility/getUnpackedAsarPath';
import log from './utility/logger';
const error = log.extend('error');

import { AppUpdater } from './appUpdater';
import { UpdateInfo } from 'electron-updater';

const isDevelopment = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;
async function main() {
  log('Starting electron app');

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
  };
  if (process.platform === 'linux' && !isDevelopment) {
    // workaround for broken .AppImage icons since electron-builder@21.0.1 removed .AppImage desktop integration
    // (https://github.com/electron-userland/electron-builder/releases/tag/v21.0.1)
    browserWindowOptions.icon = join(getUnpackedAsarPath(), 'resources/composerIcon_1024x1024.png');
  }
  mainWindow = new BrowserWindow(browserWindowOptions);

  // and load the index.html of the app.
  const CONTENT_URL = isDevelopment ? 'http://localhost:3000/' : 'http://localhost:5000/';
  log('Loading project from: ', CONTENT_URL);

  await mainWindow.loadURL(CONTENT_URL);
  mainWindow.show();
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
  const appUpdater = new AppUpdater();
  appUpdater.on('update-available', (updateInfo: UpdateInfo) => {
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
  ipcMain.on('app-update', (name, payload) => {
    console.log('got app update from client: ', name, payload);
    appUpdater.downloadUpdate();
  });
  appUpdater.checkForUpdates();
}

async function run() {
  fixPath(); // required PATH fix for Mac (https://github.com/electron/electron/issues/5626)
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      main();
    }
  });

  log('Waiting for app to be ready...');
  await app.whenReady();
  log('App ready');

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

  await main();

  initializeAppUpdater();
}

run()
  .catch(e => {
    error('Error occurred while starting Composer Electron: ', e);
    app.quit();
  })
  .then(() => {
    log('Run completed');
  });
