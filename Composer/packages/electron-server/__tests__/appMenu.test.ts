// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { initAppMenu } from '../src/appMenu';

const mockIsMac = jest.fn();
jest.mock('../src/utility/platform', () => ({
  isMac: () => mockIsMac(),
}));

const mockBuildFromTemplate = jest.fn();
const mockSetApplicationMenu = jest.fn();
jest.mock('electron', () => ({
  app: {},
  dialog: {},
  Menu: {
    buildFromTemplate: (template) => mockBuildFromTemplate(template),
    setApplicationMenu: (menu) => mockSetApplicationMenu(menu),
  },
  shell: {},
}));

describe('App menu', () => {
  beforeEach(() => {
    mockBuildFromTemplate.mockClear();
    mockSetApplicationMenu.mockClear();
  });

  it('should build the menu for windows / linux', () => {
    mockIsMac.mockReturnValue(false);
    initAppMenu();

    expect(mockBuildFromTemplate).toHaveBeenCalledTimes(1);
    const menuTemplate: any[] = mockBuildFromTemplate.mock.calls[0][0];
    expect(menuTemplate.length).toBe(5); // File, Edit, View, Window, Help

    // File
    expect(menuTemplate[0].label).toBe('File');
    expect(menuTemplate[0].submenu.length).toBe(1);

    // Edit
    expect(menuTemplate[1].label).toBe('Edit');
    expect(menuTemplate[1].submenu.length).toBe(8);

    // View
    expect(menuTemplate[2].label).toBe('View');
    expect(menuTemplate[2].submenu.length).toBe(7);

    // Window
    expect(menuTemplate[3].label).toBe('Window');
    expect(menuTemplate[3].submenu.length).toBe(3);

    // Help
    expect(menuTemplate[4].label).toBe('Help');
    expect(menuTemplate[4].submenu.length).toBe(12);

    expect(mockSetApplicationMenu).toHaveBeenCalledTimes(1);
  });

  it('should build the menu for mac', () => {
    mockIsMac.mockReturnValue(true);
    initAppMenu();

    expect(mockBuildFromTemplate).toHaveBeenCalledTimes(1);
    const menuTemplate: any[] = mockBuildFromTemplate.mock.calls[0][0];
    expect(menuTemplate.length).toBe(6); // App, File, Edit, View, Window, Help

    // App
    expect(menuTemplate[0].label).toBe('Bot Framework Composer');
    expect(menuTemplate[0].submenu.length).toBe(7);

    // File
    expect(menuTemplate[1].label).toBe('File');
    expect(menuTemplate[1].submenu.length).toBe(1);

    // Edit
    expect(menuTemplate[2].label).toBe('Edit');
    expect(menuTemplate[2].submenu.length).toBe(8);

    // View
    expect(menuTemplate[3].label).toBe('View');
    expect(menuTemplate[3].submenu.length).toBe(7);

    // Window
    expect(menuTemplate[4].label).toBe('Window');
    expect(menuTemplate[4].submenu.length).toBe(6);

    // Help
    expect(menuTemplate[5].label).toBe('Help');
    expect(menuTemplate[5].submenu.length).toBe(12);

    expect(mockSetApplicationMenu).toHaveBeenCalledTimes(1);
  });
});
