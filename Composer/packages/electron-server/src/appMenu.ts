// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { app, dialog, Menu, MenuItemConstructorOptions, shell, ipcMain } from 'electron';

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

export function initAppMenu(win?: Electron.BrowserWindow) {
  // delegate menu events to Renderer process (Composer web app)
  const handleMenuEvents = (menuEventName: string) => {
    if (win) {
      win.webContents.send('electron-menu-clicked', { label: menuEventName });
    }
  };

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
        {
          id: 'Undo',
          label: 'Undo',
          enabled: false,
          accelerator: 'CmdOrCtrl+Z',
          click: () => handleMenuEvents('undo'),
        },
        {
          id: 'Redo',
          label: 'Redo',
          enabled: false,
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => handleMenuEvents('redo'),
        },
        { type: 'separator' },
        // Native mode shorcuts
        {
          id: 'Cut-native',
          label: 'Cut',
          role: 'cut',
        },
        {
          id: 'Copy-native',
          label: 'Copy',
          role: 'copy',
        },
        {
          id: 'Paste-native',
          label: 'Paste',
          role: 'paste',
        },
        {
          id: 'Delete-native',
          label: 'Delete',
          role: 'delete',
        },
        // Action editing mode shortcuts
        {
          id: 'Cut',
          label: 'Cut',
          enabled: false,
          visible: false,
          accelerator: 'CmdOrCtrl+X',
          click: () => handleMenuEvents('cut'),
        },
        {
          id: 'Copy',
          label: 'Copy',
          enabled: false,
          visible: false,
          accelerator: 'CmdOrCtrl+C',
          click: () => handleMenuEvents('copy'),
        },
        {
          id: 'Delete',
          label: 'Delete',
          enabled: false,
          visible: false,
          accelerator: 'Delete',
          click: () => handleMenuEvents('delete'),
        },
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

  if (ipcMain && ipcMain.on) {
    ipcMain.on('composer-state-change', (e, state) => {
      const toggleEditingMode = (menu: Menu, mode: 'native' | 'action') => {
        ['Cut', 'Copy', 'Delete'].forEach((label) => {
          const nativeModeId = label + '-native';
          const actionModeId = label;
          menu.getMenuItemById(nativeModeId).visible = mode === 'native';
          menu.getMenuItemById(actionModeId).visible = mode === 'action';
        });
        menu.getMenuItemById('Paste-native').visible = mode === 'native';
      };

      // Turn shortcuts to Action editing mode when Flow Editor is focused.
      const flowFocused = !!state.flowFocused;
      if (flowFocused) {
        toggleEditingMode(menu, 'action');

        // Let menu enable/disable status reflects action selection states.
        const actionSelected = !!state.actionSelected;
        ['Cut', 'Copy', 'Delete'].forEach((id) => {
          menu.getMenuItemById(id).enabled = actionSelected;
        });
      } else {
        toggleEditingMode(menu, 'native');
      }

      // Let menu undo/redo status reflects history status
      const canUndo = !!state.canUndo;
      menu.getMenuItemById('Undo').enabled = canUndo;
      const canRedo = !!state.canRedo;
      menu.getMenuItemById('Redo').enabled = canRedo;

      Menu.setApplicationMenu(menu);
    });
  }
}
