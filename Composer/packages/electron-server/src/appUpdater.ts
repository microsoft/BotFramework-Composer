// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EventEmitter } from 'events';

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app } from 'electron';
import { prerelease as isNightly } from 'semver';
import { AppUpdaterSettings } from '@bfc/shared';

import logger from './utility/logger';
const log = logger.extend('app-updater');

let appUpdater: AppUpdater | undefined;
export class AppUpdater extends EventEmitter {
  private checkingForUpdate = false;
  private downloadingUpdate = false;
  private _downloadedUpdate = false;
  private explicitCheck = false;
  private settings: AppUpdaterSettings = { autoDownload: false, useNightly: false };

  constructor() {
    super();

    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoInstallOnAppQuit = false; // we will explicitly call the install logic

    autoUpdater.on('error', this.onError.bind(this));
    autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this));
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
    autoUpdater.on('download-progress', this.onDownloadProgress.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    logger('Initialized');
  }

  public static getInstance(): AppUpdater {
    if (!appUpdater) {
      appUpdater = new AppUpdater();
    }
    return appUpdater;
  }

  /**
   * Checks GitHub for Composer updates
   * @param explicit If true, the user explicitly checked for an update via the Help menu,
   * and we will show UI if there are no available updates.
   */
  public checkForUpdates(explicit = false) {
    if (!(this.checkingForUpdate || this.downloadingUpdate)) {
      this.explicitCheck = explicit;
      this.setFeedURL();
      this.determineUpdatePath();
      autoUpdater.autoDownload = this.settings.autoDownload;
      autoUpdater.checkForUpdates();
    }
  }

  public downloadUpdate() {
    if (!this.downloadingUpdate) {
      this.downloadingUpdate = true;
      autoUpdater.downloadUpdate();
    }
  }

  public quitAndInstall() {
    logger('Quitting and installing...');
    autoUpdater.quitAndInstall();
  }

  public setSettings(settings: AppUpdaterSettings) {
    this.settings = settings;
  }

  public get downloadedUpdate(): boolean {
    return this._downloadedUpdate;
  }

  private onError(err: Error) {
    logger('Got error while checking for updates: ', err);
    this.resetToIdle();
    try {
      this.emit('error', err); // emitting 'error' will throw an error
    } catch (e) {} // eslint-disable-line
  }

  private onCheckingForUpdate() {
    log('Checking for updates...');
    this.checkingForUpdate = true;
  }

  private onUpdateAvailable(updateInfo: UpdateInfo) {
    log('Update available: %O', updateInfo);
    this.checkingForUpdate = false;
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.emit('update-available', updateInfo);
    }
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    log('Update not available: %O', updateInfo);
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.emit('update-not-available', this.explicitCheck);
    }
    this.resetToIdle();
  }

  private onDownloadProgress(progress: any) {
    log('Got update progress: %O', progress);
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.emit('progress', progress);
    }
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    log('Update downloaded: %O', updateInfo);
    this._downloadedUpdate = true;
    this.resetToIdle();
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.emit('update-downloaded', updateInfo);
    }
  }

  private resetToIdle() {
    log('Resetting to idle...');
    this.checkingForUpdate = false;
    this.downloadingUpdate = false;
    this.explicitCheck = false;
  }

  private setFeedURL() {
    if (this.settings.useNightly) {
      log('Updates set to be retrieved from nightly repo.');
      autoUpdater.setFeedURL({
        provider: 'github',
        repo: 'BotFramework-Composer-Nightlies',
        owner: 'microsoft',
        vPrefixedTagName: true, // whether our release tags are prefixed with v or not
      });
    } else {
      log('Updates set to be retrieved from stable repo.');
      autoUpdater.setFeedURL({
        provider: 'github',
        repo: 'BotFramework-Composer',
        owner: 'microsoft',
        vPrefixedTagName: true,
      });
    }
  }

  private determineUpdatePath() {
    const currentVersion = app.getVersion();

    // The following paths don't need to allow downgrade:
    //    nightly -> stable     (1.0.1-nightly.x.x -> 1.0.2)
    //    nightly -> nightly    (1.0.1-nightly.x.x -> 1.0.1-nightly.y.x)
    if (isNightly(currentVersion)) {
      const targetChannel = this.settings.useNightly ? 'nightly' : 'stable';
      log(`Updating from nightly to ${targetChannel}. Not allowing downgrade.`);
      autoUpdater.allowDowngrade = false;
      return;
    }

    // https://github.com/npm/node-semver/blob/v7.3.2/classes/semver.js#L127
    // The following path needs to allow downgrade to work:
    //    stable -> nightly     (1.0.1 -> 1.0.1-nightly.x.x)
    if (!isNightly(currentVersion) && this.settings.useNightly) {
      log(`Updating from stable to nightly. Allowing downgrade.`);
      autoUpdater.allowDowngrade = true;
      return;
    }

    // stable -> stable
    log('Updating from stable to stable. Not allowing downgrade.');
    autoUpdater.allowDowngrade = false;
  }
}
