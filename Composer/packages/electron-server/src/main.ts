// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolve } from 'path';
import { start } from '@bfc/server';
import { mkdirp } from 'fs-extra';
import { app, BrowserWindow } from 'electron';

import settings from './settings';

function main() {
  console.log('starting electron app');
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
  win.loadURL(`http://localhost:5000/`);

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
  console.log('Creating temp store');
  await createTempStore();
  console.log(`Composer settings: ${JSON.stringify(settings, null, ' ')}`);
  console.log('starting server');
  // TODO: race condition with store being started
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  //const { start } = require('./server');
  await start();
  console.log('beginning app start up');

  // TODO: fix race condition
  // this isn't working for some reason, but since we are awaiting the other calls, main seems to work
  // app.on('ready', main);
  main(); // might be fs calls locking up (node 13 histogram for event loop)

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
}

run()
  .catch(e => {
    console.error(e);
    app.quit();
  })
  .then(() => {
    console.log('run completed');
  });
