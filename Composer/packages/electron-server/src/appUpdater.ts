// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { EventEmitter } from 'events';

import logger from './utility/logger';
const log = logger.extend('app-updater');

export class AppUpdater extends EventEmitter {
  private checkingForUpdate: boolean = false;

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
    if (!this.checkingForUpdate) {
      autoUpdater.checkForUpdates();
    }
  }

  public downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  public quitAndInstall() {
    autoUpdater.quitAndInstall();
  }

  private onError(err: Error) {
    this.checkingForUpdate = false;
    logger('Got error while checking for updates: ', err);
    this.emit('error', err);
  }

  private onCheckingForUpdate() {
    // flip some state to change UI in client
    this.checkingForUpdate = true;
    log('Checking for updates...');
  }

  private onUpdateAvailable(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    console.log('update available');
    log('Update available: %O', updateInfo);
    this.emit('update-available', updateInfo);
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    log('Update not available: %O', updateInfo);
    this.emit('update-not-available');
  }

  private onDownloadProgress(progress: any) {
    log('Got update progress: %O', progress);
    this.emit('progress', progress);
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    log('Update downloaded: %O', updateInfo);
    this.emit('update-downloaded');
  }
}
