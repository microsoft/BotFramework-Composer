// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EventEmitter } from 'events';

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app } from 'electron';
import { prerelease as isNightly } from 'semver';
import { AppUpdaterSettings } from '@bfc/shared';

import logger from '../utility/logger';

import { breakingUpdates } from './breakingUpdates';

const log = logger.extend('app-updater');

export type BreakingUpdateMetaData = {
  explicitCheck: boolean;
  uxId: string;
};

let appUpdater: AppUpdater | undefined;
export class AppUpdater extends EventEmitter {
  private currentAppVersion = app.getVersion();
  private checkingForUpdate = false;
  private downloadingUpdate = false;
  private _downloadedUpdate = false;
  private explicitCheck = false;
  private isBreakingUpdate = false;
  private updateInfo: UpdateInfo | undefined = undefined;
  private settings: AppUpdaterSettings = { autoDownload: false, useNightly: false };

  constructor() {
    super();

    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = false;
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
    this.explicitCheck = explicit;
    if (this.downloadingUpdate || this.checkingForUpdate) {
      this.emit('update-in-progress', this.updateInfo);
      return;
    }

    this.setFeedURL();
    this.determineUpdatePath();
    autoUpdater.checkForUpdates();
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
    this.updateInfo = updateInfo;

    // check to see if the update will include breaking changes
    const breakingUpdate = breakingUpdates
      .map((predicate) => predicate(this.currentAppVersion, updateInfo.version))
      .find((result) => result.breaking);
    if (breakingUpdate) {
      this.isBreakingUpdate = true;
      // show custom UX for the breaking changes
      this.emit('breaking-update-available', updateInfo, {
        uxId: breakingUpdate.uxId,
        explicitCheck: this.explicitCheck,
      });
      return;
    }

    // show standard update UX
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.isBreakingUpdate = false;
      this.emit('update-available', updateInfo);
    } else {
      // silently download
      autoUpdater.downloadUpdate();
    }
  }

  private onUpdateNotAvailable(updateInfo: UpdateInfo) {
    log('Update not available: %O', updateInfo);
    this.updateInfo = updateInfo;
    if (this.explicitCheck || !this.settings.autoDownload) {
      this.emit('update-not-available', this.explicitCheck);
    }
    this.resetToIdle();
  }

  private onDownloadProgress(progress: any) {
    log('Got update progress: %O', progress);
    this.downloadingUpdate = true;
    if (this.explicitCheck || !this.settings.autoDownload || this.isBreakingUpdate) {
      this.emit('progress', progress);
    }
  }

  private onUpdateDownloaded(updateInfo: UpdateInfo) {
    log('Update downloaded: %O', updateInfo);
    this._downloadedUpdate = true;
    this.updateInfo = updateInfo;
    if (this.explicitCheck || !this.settings.autoDownload || this.isBreakingUpdate) {
      this.emit('update-downloaded', updateInfo);
    }
    this.resetToIdle();
  }

  private resetToIdle() {
    log('Resetting to idle...');
    this.checkingForUpdate = false;
    this.downloadingUpdate = false;
    this.explicitCheck = false;
  }

  private setFeedURL() {
    // TODO: re-enable once testing is done

    // if (this.settings.useNightly) {
    //   log('Updates set to be retrieved from nightly repo.');
    //   autoUpdater.setFeedURL({
    //     provider: 'github',
    //     repo: 'BotFramework-Composer-Nightlies',
    //     owner: 'microsoft',
    //     vPrefixedTagName: true, // whether our release tags are prefixed with v or not
    //   });
    // } else {
    //   log('Updates set to be retrieved from stable repo.');
    //   autoUpdater.setFeedURL({
    //     provider: 'github',
    //     repo: 'BotFramework-Composer',
    //     owner: 'microsoft',
    //     vPrefixedTagName: true,
    //   });
    // }
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: 'electron-updates-PPE-nightly',
      owner: 'tonyanziano',
      vPrefixedTagName: true,
      private: true,
    });
  }

  private determineUpdatePath() {
    // The following paths don't need to allow downgrade:
    //    nightly -> stable     (1.0.1-nightly.x.x -> 1.0.2)
    //    nightly -> nightly    (1.0.1-nightly.x.x -> 1.0.1-nightly.y.x)
    if (isNightly(this.currentAppVersion)) {
      const targetChannel = this.settings.useNightly ? 'nightly' : 'stable';
      log(`Updating from nightly to ${targetChannel}. Not allowing downgrade.`);
      autoUpdater.allowDowngrade = false;
      return;
    }

    // https://github.com/npm/node-semver/blob/v7.3.2/classes/semver.js#L127
    // The following path needs to allow downgrade to work:
    //    stable -> nightly     (1.0.1 -> 1.0.1-nightly.x.x)
    if (!isNightly(this.currentAppVersion) && this.settings.useNightly) {
      log(`Updating from stable to nightly. Allowing downgrade.`);
      autoUpdater.allowDowngrade = true;
      return;
    }

    // stable -> stable
    log('Updating from stable to stable. Not allowing downgrade.');
    autoUpdater.allowDowngrade = false;
  }
}
