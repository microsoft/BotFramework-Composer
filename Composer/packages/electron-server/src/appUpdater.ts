// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';

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
  }

  public checkForUpdates() {
    if (!this.checkingForUpdate) {
      autoUpdater.checkForUpdates();
    }
  }

  private onError() {
    this.checkingForUpdate = false;
  }

  private onCheckingForUpdate() {
    // flip some state to change UI in client
    this.checkingForUpdate = true;
  }

  private onUpdateAvailable() {
    this.checkingForUpdate = false;
  }

  private onUpdateNotAvailable() {
    this.checkingForUpdate = false;
  }

  private onDownloadProgress() {}

  private onUpdateDownloaded() {
    this.checkingForUpdate = false;
  }
}
