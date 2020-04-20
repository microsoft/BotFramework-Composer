// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const mockAutoUpdater = {
  checkForUpdates: jest.fn(),
  downloadUpdate: jest.fn(),
  on: jest.fn(),
  quitAndInstall: jest.fn(),
  setFeedURL: jest.fn(),
};
jest.mock('electron-updater', () => ({
  autoUpdater: mockAutoUpdater,
}));

import { AppUpdater } from '../src/appUpdater';

describe('App updater', () => {
  let appUpdater: AppUpdater;
  beforeEach(() => {
    appUpdater = new AppUpdater();
    mockAutoUpdater.checkForUpdates.mockClear();
    mockAutoUpdater.checkForUpdates.mockClear();
    mockAutoUpdater.downloadUpdate.mockClear();
    mockAutoUpdater.on.mockClear();
    mockAutoUpdater.quitAndInstall.mockClear();
    mockAutoUpdater.setFeedURL.mockClear();
  });

  it('should check for updates', () => {
    appUpdater.checkForUpdates();

    expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
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

  it('should download an update', () => {
    appUpdater.downloadUpdate();

    expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled();
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
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).onUpdateNotAvailable('update info');

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('update-not-available', 'update info');
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
    (appUpdater as any).onUpdateDownloaded('update info');

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect((appUpdater as any).downloadingUpdate).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('update-downloaded', 'update info');
  });

  it('should reset to idle status', () => {
    (appUpdater as any).checkingForUpdate = true;
    (appUpdater as any).downloadingUpdate = true;
    (appUpdater as any).resetToIdle();

    expect((appUpdater as any).checkingForUpdate).toBe(false);
    expect((appUpdater as any).downloadingUpdate).toBe(false);
  });
});
