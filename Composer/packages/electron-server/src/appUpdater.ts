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
      repo: 'BotFramework-Composer',
      owner: 'microsoft',
    });

    autoUpdater.on('error', this.onError);
    autoUpdater.on('checking-for-update', this.onCheckingForUpdate);
    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
    autoUpdater.on('download-progress', this.onDownloadProgress);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
    logger('Initialized');
  }

  public checkForUpdates() {
    if (!this.checkingForUpdate) {
      autoUpdater.checkForUpdates();
    }
  }

  private onError(err: Error) {
    this.checkingForUpdate = false;
    logger('Got error while checking for updates: ', err);
  }

  private onCheckingForUpdate() {
    // flip some state to change UI in client
    this.checkingForUpdate = true;
    log('Checking for updates...');
  }

  private onUpdateAvailable(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    log('Update available: %O', updateInfo);
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    log('Update not available: %O', updateInfo);
  }

  private onDownloadProgress(progress: any, ...other) {
    log('Got update progress: %O %O', progress, other);
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    this.checkingForUpdate = false;
    log('Update downloaded: %O', updateInfo);
  }
}
