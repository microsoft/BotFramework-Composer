// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { app, dialog, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { getEditorAPI } from '@bfc/shared';

import { isMac } from './utility/platform';
import { AppUpdater } from './appUpdater';

function getAppMenu(): MenuItemConstructorOptions[] {
  if (isMac()) {
    return [
      {
        label: 'Bot Framework Composer',
        submenu: [
          { role: 'services' },
          { type: 'separator' },
          { label: 'Hide Bot Framework Composer', role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit Bot Framework Composer', role: 'quit' },
        ],
      },
    ];
  }
  return [];
}

function getRestOfEditMenu(): MenuItemConstructorOptions[] {
  if (isMac()) {
    return [
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
      },
    ];
  }
  return [{ type: 'separator' }, { role: 'selectAll' }];
}

function getRestOfWindowMenu(): MenuItemConstructorOptions[] {
  if (isMac()) {
    return [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }];
  }
  return [{ role: 'close' }];
}

export function initAppMenu() {
  // Global window functions registered by Composer core app.
  const EditorAPI = getEditorAPI();
  const template: MenuItemConstructorOptions[] = [
    // App (Mac)
    ...getAppMenu(),
    // File
    {
      label: 'File',
      submenu: [isMac() ? { role: 'close' } : { role: 'quit' }],
    },
    // Edit
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', click: () => EditorAPI.Editing.Undo() },
        { role: 'redo', click: () => EditorAPI.Editing.Redo() },
        { type: 'separator' },
        { role: 'cut', click: () => EditorAPI.Actions.CutSelection() },
        { role: 'copy', click: () => EditorAPI.Actions.CopySelection() },
        { role: 'delete', click: () => EditorAPI.Actions.DeleteSelection() },
        ...getRestOfEditMenu(),
      ],
    },
    // View
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // Window
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, ...getRestOfWindowMenu()],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://docs.microsoft.com/en-us/composer/');
          },
        },
        {
          label: 'Composer on GitHub',
          click: async () => {
            await shell.openExternal('https://aka.ms/BotFrameworkComposer');
          },
        },
        {
          label: 'Learn More About Bot Framework',
          click: async () => {
            await shell.openExternal('https://dev.botframework.com/');
          },
        },
        { type: 'separator' },
        {
          label: 'Report an Issue',
          click: async () => {
            await shell.openExternal('https://github.com/microsoft/BotFramework-Composer/issues/new/choose');
          },
        },
        { type: 'separator' },
        {
          label: 'View License',
          click: async () => {
            await shell.openExternal('https://aka.ms/bfcomposer-license');
          },
        },
        {
          label: 'Privacy Statement',
          click: async () => {
            await shell.openExternal('https://aka.ms/bfcomposer-privacy');
          },
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            AppUpdater.getInstance().checkForUpdates(true);
          },
        },
        { type: 'separator' },
        {
          label: 'About',
          click: async () => {
            // show dialog with name and version
            dialog.showMessageBox({
              title: 'Bot Framework Composer',
              message: `
                Bot Framework Composer

                Version:  ${app.getVersion()}
                Electron: ${process.versions.electron}
                Chrome: ${process.versions.chrome}
                NodeJS: ${process.versions.node}
                V8: ${process.versions.v8}
              `,
              type: 'info',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
