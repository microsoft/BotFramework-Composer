// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { EventEmitter } from 'events';

import logger from './utility/logger';
const log = logger.extend('app-updater');

export class AppUpdater extends EventEmitter {
  private checkingForUpdate: boolean = false;
  private downloadingUpdate: boolean = false;

  constructor() {
    super();

    const settings = { autoDownload: false, useNightly: false }; // TODO: load settings from disk
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = settings.useNightly;
    autoUpdater.autoDownload = settings.autoDownload;
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: 'One-Off-File-Distribution', // 'BotFramework-Composer',
      owner: 'tonyanziano', //'microsoft',
      private: true,
    });

    autoUpdater.on('error', this.onError);
    autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this));
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
    autoUpdater.on('download-progress', this.onDownloadProgress.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    logger('Initialized');
  }

  public checkForUpdates() {
    if (!(this.checkingForUpdate || this.downloadingUpdate)) {
      autoUpdater.checkForUpdates();
    }
  }

  public downloadUpdate() {
    if (!this.downloadingUpdate) {
      autoUpdater.downloadUpdate();
    }
  }

  public quitAndInstall() {
    logger('Quitting and installing...');
    autoUpdater.quitAndInstall();
  }

  private onError(err: Error) {
    logger('Got error while checking for updates: ', err);
    this.resetToIdle();
    this.emit('error', err);
  }

  private onCheckingForUpdate() {
    log('Checking for updates...');
    this.checkingForUpdate = true;
  }

  private onUpdateAvailable(updateInfo: UpdateInfo) {
    log('Update available: %O', updateInfo);
    this.checkingForUpdate = false;
    this.emit('update-available', updateInfo);
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    log('Update not available: %O', updateInfo);
    this.resetToIdle();
    this.emit('update-not-available');
  }

  private onDownloadProgress(progress: any) {
    log('Got update progress: %O', progress);
    this.emit('progress', progress);
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    log('Update downloaded: %O', updateInfo);
    this.resetToIdle();
    this.emit('update-downloaded');
  }

  private resetToIdle() {
    log('Resetting to idle...');
    this.checkingForUpdate = false;
    this.downloadingUpdate = false;
  }
}
