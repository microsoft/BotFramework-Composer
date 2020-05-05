// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EventEmitter } from 'events';

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app } from 'electron';
import { prerelease as isNightly } from 'semver';

import logger from './utility/logger';
const log = logger.extend('app-updater');

interface AppUpdaterSettings {
  autoDownload: boolean;
  useNightly: boolean;
}

let appUpdater: AppUpdater | undefined;
export class AppUpdater extends EventEmitter {
  private checkingForUpdate = false;
  private downloadingUpdate = false;
  private explicitCheck = false;

  constructor() {
    super();

    const settings = this.getSettings();
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = settings.autoDownload;

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
  public checkForUpdates(explicit: boolean = false) {
    if (!(this.checkingForUpdate || this.downloadingUpdate)) {
      this.explicitCheck = explicit;
      this.setFeedURL();
      this.determineUpdatePath();
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
    this.emit('update-available', updateInfo);
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    log('Update not available: %O', updateInfo);
    this.emit('update-not-available', this.explicitCheck);
    this.resetToIdle();
  }

  private onDownloadProgress(progress: any) {
    log('Got update progress: %O', progress);
    this.emit('progress', progress);
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    log('Update downloaded: %O', updateInfo);
    this.resetToIdle();
    this.emit('update-downloaded', updateInfo);
  }

  private resetToIdle() {
    log('Resetting to idle...');
    this.checkingForUpdate = false;
    this.downloadingUpdate = false;
    this.explicitCheck = false;
  }

  private setFeedURL() {
    const settings = this.getSettings();
    if (settings.useNightly) {
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
      log(`Updating from nightly to (stable | nightly). Not allowing downgrade.`);
      autoUpdater.allowDowngrade = false;
      return;
    }

    // https://github.com/npm/node-semver/blob/v7.3.2/classes/semver.js#L127
    // The following path needs to allow downgrade to work:
    //    stable -> nightly     (1.0.1 -> 1.0.1-nightly.x.x)
    const settings = this.getSettings();
    if (!isNightly(currentVersion) && settings.useNightly) {
      log(`Updating from stable to nightly. Allowing downgrade.`);
      autoUpdater.allowDowngrade = true;
      return;
    }

    // stable -> stable
    log('Updating from stable to stable. Not allowing downgrade.');
    autoUpdater.allowDowngrade = false;
  }

  private getSettings(): AppUpdaterSettings {
    // TODO: replace with actual implementation that fetches settings from disk
    return { autoDownload: false, useNightly: true };
  }
}
