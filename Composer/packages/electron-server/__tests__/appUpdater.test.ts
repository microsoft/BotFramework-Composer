// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AppUpdater } from '../src/appUpdater';

const mockAutoUpdater = {
  allowDowngrade: false,
  autoDownload: false,
  checkForUpdates: jest.fn(),
  downloadUpdate: jest.fn(),
  on: jest.fn(),
  quitAndInstall: jest.fn(),
  setFeedURL: jest.fn(),
};
jest.mock('electron-updater', () => ({
  get autoUpdater() {
    return mockAutoUpdater;
  },
}));

const mockGetVersion = jest.fn(() => '0.0.1');
jest.mock('electron', () => ({
  app: {
    getVersion: () => mockGetVersion(),
  },
}));

describe('App updater', () => {
  let appUpdater: AppUpdater;
  beforeEach(() => {
    mockAutoUpdater.allowDowngrade = false;
    mockAutoUpdater.autoDownload = false;
    appUpdater = AppUpdater.getInstance();
    (appUpdater as any).currentAppVersion = mockGetVersion();
    (appUpdater as any).checkingForUpdate = false;
    (appUpdater as any).downloadingUpdate = false;
    (appUpdater as any)._downloadedUpdate = false;
    (appUpdater as any).settings = { autoDownload: false, useNightly: true };
    mockAutoUpdater.checkForUpdates.mockClear();
    mockAutoUpdater.checkForUpdates.mockClear();
    mockAutoUpdater.downloadUpdate.mockClear();
    mockAutoUpdater.on.mockClear();
    mockAutoUpdater.quitAndInstall.mockClear();
    mockAutoUpdater.setFeedURL.mockClear();
    mockGetVersion.mockClear();
  });

  it('should check for updates from the nightly repo', () => {
    (appUpdater as any).settings.useNightly = true;
    appUpdater.checkForUpdates(true);

    expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
    expect((appUpdater as any).explicitCheck).toBe(true);
    expect(mockAutoUpdater.setFeedURL).toHaveBeenCalledWith({
      provider: 'github',
      repo: 'BotFramework-Composer-Nightlies',
      owner: 'microsoft',
      vPrefixedTagName: true,
    });
  });

  it('should check for updates from the stable repo', () => {
    (appUpdater as any).settings.useNightly = false;
    appUpdater.checkForUpdates(true);

    expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
    expect((appUpdater as any).explicitCheck).toBe(true);
    expect(mockAutoUpdater.setFeedURL).toHaveBeenCalledWith({
      provider: 'github',
      repo: 'BotFramework-Composer',
      owner: 'microsoft',
      vPrefixedTagName: true,
    });
  });

  it('should not check for updates if it is already checking for an update', () => {
    (appUpdater as any).checkingForUpdate = true;
    appUpdater.checkForUpdates();

    expect(mockAutoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('should not check for an update if it is already downloading an update', () => {
    (appUpdater as any).downloadingUpdate = true;
    appUpdater.checkForUpdates();

    expect(mockAutoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('should not allow a downgrade when checking for updates from nightly to (stable or nightly)', () => {
    (appUpdater as any).currentAppVersion = '0.0.1-nightly.12345.abcdef';
    mockAutoUpdater.allowDowngrade = true;
    appUpdater.checkForUpdates();
    expect(mockAutoUpdater.allowDowngrade).toBe(false);
  });

  it('should not allow a downgrade when checking for updates from stable to stable', () => {
    mockGetVersion.mockReturnValueOnce('0.0.1');
    (appUpdater as any).settings.useNightly = false;
    mockAutoUpdater.allowDowngrade = true;
    appUpdater.checkForUpdates();

    expect(mockAutoUpdater.allowDowngrade).toBe(false);
  });

  it('should allow a downgrade when checking for updates from stable to nightly', () => {
    mockGetVersion.mockReturnValueOnce('0.0.1');
    (appUpdater as any).settings.useNightly = true;
    mockAutoUpdater.allowDowngrade = false;
    appUpdater.checkForUpdates();

    expect(mockAutoUpdater.allowDowngrade).toBe(true);
  });

  it('should download an update', () => {
    appUpdater.downloadUpdate();

    expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled();
    expect((appUpdater as any).downloadingUpdate).toBe(true);
  });

  it('should not download an update if it is already downloading an update', () => {
    (appUpdater as any).downloadingUpdate = true;
    appUpdater.downloadUpdate();

    expect(mockAutoUpdater.downloadUpdate).not.toHaveBeenCalled();
  });

  it('should handle an error', () => {
    const emitSpy = jest.spyOn(appUpdater, 'emit');
    (appUpdater as any).onError('some error');

    expect(emitSpy).toHaveBeenCalledWith('error', 'some error');
  });

  it('should handle checking for update', () => {
    jest.spyOn(appUpdater, 'emit');
    (appUpdater as any).onCheckingForUpdate();

    expect((appUpdater as any).checkingForUpdate).toBe(true);
  });

  it('should handle an available update', () => {
    const emitSpy = jest.spyOn(appUpdater, 'emit');
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).onUpdateAvailable('update info');

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('update-available', 'update info');
  });

  it('should handle no available update', () => {
    const emitSpy = jest.spyOn(appUpdater, 'emit');
    const explicit = true;
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).explicitCheck = explicit;
    (appUpdater as any).onUpdateNotAvailable('update info');

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect((appUpdater as any).explicitCheck).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('update-not-available', explicit);
  });

  it('should handle download progress', () => {
    const emitSpy = jest.spyOn(appUpdater, 'emit');
    (appUpdater as any).onDownloadProgress('25%');

    expect(emitSpy).toHaveBeenCalledWith('progress', '25%');
  });

  it('should handle a downloaded update', () => {
    const emitSpy = jest.spyOn(appUpdater, 'emit');
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).downloadingUpdate = true;
    (appUpdater as any)._downloadedUpdate = false;
    (appUpdater as any).onUpdateDownloaded('update info');

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect((appUpdater as any).downloadingUpdate).toBe(false);
    expect(appUpdater.downloadedUpdate).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('update-downloaded', 'update info');
  });

  it('should reset to idle status', () => {
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).downloadingUpdate = true;
    (appUpdater as any).resetToIdle();

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect((appUpdater as any).downloadingUpdate).toBe(false);
  });

  it('should set settings', () => {
    appUpdater.setSettings({ autoDownload: true, useNightly: true });

    expect((appUpdater as any).settings).toEqual({ autoDownload: true, useNightly: true });
  });
});
