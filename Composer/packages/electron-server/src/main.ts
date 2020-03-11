// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolve } from 'path';
import { start } from '@bfc/server';
import { mkdirp } from 'fs-extra';
import { app, BrowserWindow } from 'electron';

import settings from './settings';

function main() {
  console.log('Starting electron app');
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
  });

  // and load the index.html of the app.
  const CONTENT_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'http://localhost:5000/';
  console.log('Loading project from: ', CONTENT_URL);
  win.loadURL(CONTENT_URL);

  win.maximize();
  win.show();
}

async function createTempStore() {
  const appDataBasePath: string = process.env.APPDATA || process.env.HOME || '';
  const compserAppDataDirectoryName = 'BotFrameworkComposer';
  const composerAppDataPath: string = resolve(appDataBasePath, compserAppDataDirectoryName);

  settings.appDataPath = resolve(composerAppDataPath, 'data.json');
  settings.runtimeFolder = resolve(__dirname, 'templates');

  await mkdirp(composerAppDataPath);
}

async function run() {
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

  console.log('Waiting for app to be ready...');
  await app.whenReady();
  console.log('App ready');

  console.log('Creating temp store');
  await createTempStore();
  console.log(`Composer settings: ${JSON.stringify(settings, null, ' ')}`);

  console.log('Starting server');
  await start();
  console.log('Beginning app start up');

  main();
}

run()
  .catch(e => {
    console.error(e);
    app.quit();
  })
  .then(() => {
    console.log('Run completed');
  });
