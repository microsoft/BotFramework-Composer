// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BrowserWindow, systemPreferences } from 'electron';

import { getSplashScreenContent, statusElmId } from './template';

export type SplashScreenProps = {
  getMainWindow: () => BrowserWindow | undefined;
  color?: string;
  icon?: string;
  width?: number;
  height?: number;
  productName?: string;
  productFamily?: string;
  logo?: string;
  website?: string;
  status?: string;
};

export const initSplashScreen = ({
  getMainWindow,
  color: initColor,
  icon,
  width = 600,
  height = 400,
  productName,
  productFamily,
  logo,
  website,
  status,
}: SplashScreenProps) => {
  // If no color is provided, uses OS accent color
  const color = initColor || (systemPreferences.getAccentColor && `#${systemPreferences.getAccentColor()}`);

  const splashScreenWindow = new BrowserWindow({
    parent: getMainWindow(),
    show: false,
    width,
    height,
    modal: true,
    transparent: true,
    skipTaskbar: true,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    icon,
    webPreferences: {
      webSecurity: false,
    },
  });

  const args = {
    productName,
    productFamily,
    logo,
    website,
    color,
    status,
  };

  const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(getSplashScreenContent(args));
  splashScreenWindow.loadURL(file);
  splashScreenWindow.show();

  const startApp = () => {
    setTimeout(() => splashScreenWindow.destroy(), 500);
    getMainWindow()?.show();
  };

  const updateStatus = async (status: string) => {
    await splashScreenWindow.webContents.executeJavaScript(
      `document.querySelector('#${statusElmId}').textContent = '${status}';`
    );
  };

  return { startApp, updateStatus };
};
