// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { app, clipboard, dialog, ipcMain, Menu, MenuItemConstructorOptions, shell } from 'electron';
import formatMessage from 'format-message';

import { AppUpdater } from './appUpdater';
import { isMac } from './utility/platform';

function getAppMenu(): MenuItemConstructorOptions[] {
  if (isMac()) {
    return [
      {
        label: 'Bot Framework Composer',
        submenu: [
          { role: 'services', label: formatMessage('Services') },
          { type: 'separator' },
          { role: 'hide', label: formatMessage('Hide Bot Framework Composer') },
          { role: 'hideOthers', label: formatMessage('Hide Others') },
          { role: 'unhide', label: formatMessage('Show All') },
          { type: 'separator' },
          { label: formatMessage('Quit Bot Framework Composer'), role: 'quit' },
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
        label: formatMessage('Speech'),
        submenu: [
          { role: 'startSpeaking', label: formatMessage('Start Speaking') },
          { role: 'stopSpeaking', label: formatMessage('Stop Speaking') },
        ],
      },
    ];
  }
  return [{ type: 'separator' }, { role: 'selectAll', label: formatMessage('Select All') }];
}

function getRestOfWindowMenu(): MenuItemConstructorOptions[] {
  if (isMac()) {
    return [
      { type: 'separator' },
      { role: 'front', label: formatMessage('Bring All to Front') },
      { type: 'separator' },
      { role: 'window', label: formatMessage('Window') },
    ];
  }
  return [{ role: 'close', label: formatMessage('Close') }];
}

function getAppVersionInfo() {
  return [
    `Version:  ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Chrome: ${process.versions.chrome}`,
    `NodeJS: ${process.versions.node}`,
    `V8: ${process.versions.v8}`,
  ].join('\n');
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
      label: formatMessage('File'),
      submenu: [
        isMac()
          ? { role: 'close', label: formatMessage('Close Window') }
          : { role: 'quit', label: formatMessage('Exit') },
      ],
    },
    // Edit
    {
      label: formatMessage('Edit'),
      submenu: [
        {
          id: 'Undo',
          label: formatMessage('Undo'),
          enabled: false,
          accelerator: 'CmdOrCtrl+Z',
          click: () => handleMenuEvents('undo'),
        },
        {
          id: 'Redo',
          label: formatMessage('Redo'),
          enabled: false,
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => handleMenuEvents('redo'),
        },
        { type: 'separator' },
        // Native mode shortcuts
        {
          id: 'Cut-native',
          label: formatMessage('Cut'),
          role: 'cut',
        },
        {
          id: 'Copy-native',
          label: formatMessage('Copy'),
          role: 'copy',
        },
        {
          id: 'Paste-native',
          label: formatMessage('Paste'),
          role: 'paste',
        },
        {
          id: 'Delete-native',
          label: formatMessage('Delete'),
          role: 'delete',
        },
        // Action editing mode shortcuts
        {
          id: 'Cut',
          label: formatMessage('Cut'),
          enabled: false,
          visible: false,
          accelerator: 'CmdOrCtrl+X',
          click: () => handleMenuEvents('cut'),
        },
        {
          id: 'Copy',
          label: formatMessage('Copy'),
          enabled: false,
          visible: false,
          accelerator: 'CmdOrCtrl+C',
          click: () => handleMenuEvents('copy'),
        },
        {
          id: 'Delete',
          label: formatMessage('Delete'),
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
      label: formatMessage('View'),
      submenu: [
        { role: 'toggleDevTools', label: formatMessage('Toggle Developer Tools') },
        { type: 'separator' },
        { role: 'resetZoom', label: formatMessage('Actual Zoom') },
        { role: 'zoomIn', label: formatMessage('Zoom In') },
        { role: 'zoomOut', label: formatMessage('Zoom Out') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: formatMessage('Toggle Full Screen') },
      ],
    },
    // Window
    {
      label: formatMessage('Window'),
      submenu: [
        { role: 'minimize', label: formatMessage('Minimize') },
        { role: 'zoom', label: formatMessage('Zoom') },
        ...getRestOfWindowMenu(),
      ],
    },
    {
      label: formatMessage('Help'),
      submenu: [
        {
          label: formatMessage('Documentation'),
          click: async () => {
            await shell.openExternal('https://docs.microsoft.com/en-us/composer/');
          },
        },
        {
          label: formatMessage('Composer on GitHub'),
          click: async () => {
            await shell.openExternal('https://aka.ms/BotFrameworkComposer');
          },
        },
        {
          label: formatMessage('Learn More About Bot Framework'),
          click: async () => {
            await shell.openExternal('https://dev.botframework.com/');
          },
        },
        { type: 'separator' },
        {
          label: formatMessage('Report an Issue'),
          click: async () => {
            await shell.openExternal('https://github.com/microsoft/BotFramework-Composer/issues/new/choose');
          },
        },
        { type: 'separator' },
        {
          label: formatMessage('View License'),
          click: async () => {
            await shell.openExternal('https://aka.ms/bfcomposer-license');
          },
        },
        {
          label: formatMessage('Privacy Statement'),
          click: async () => {
            await shell.openExternal('https://aka.ms/bfcomposer-privacy');
          },
        },
        { type: 'separator' },
        {
          label: formatMessage('Check for Updates'),
          click: () => {
            AppUpdater.getInstance().checkForUpdates(true);
          },
        },
        { type: 'separator' },
        {
          label: formatMessage('About'),
          click: async () => {
            // show dialog with name and version
            dialog
              .showMessageBox({
                title: 'Bot Framework Composer',
                message: ['Bot Framework Composer', '', getAppVersionInfo()].join('\n'),
                type: 'info',
                buttons: ['Copy', 'OK'],
                defaultId: 1,
                noLink: true,
              })
              .then((selection) => {
                if (selection.response === 0) {
                  clipboard.writeText(getAppVersionInfo());
                }
              });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (ipcMain?.on) {
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
