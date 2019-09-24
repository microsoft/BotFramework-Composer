//eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
///<reference path='../../../types/selfHostCommands.d.ts'/>.
import { resolve } from 'path';

import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishVersion } from './interface';

export class SelfHostBotConnector implements IBotConnector {
  constructor() {
    this.buildAsync = require('commands/build').handlerAsync;
    this.publishAsync = require('commands/publish').handlerAsync;
    this.getEditingStatusAsync = require('commands/editingStatus').handlerAsync;
    this.getPublishVersionsAsync = require('commands/getPublishVersions').handlerAsync;
  }
  private buildAsync: SelfHostCommands.Build;
  private publishAsync: SelfHostCommands.Publish;
  private getEditingStatusAsync: SelfHostCommands.GetEditingStatus;
  private getPublishVersionsAsync: SelfHostCommands.GetPublishVersions;
  public status: BotStatus = BotStatus.NotConnected;

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const { targetEnvironment: env } = config;
    const user = config.user ? config.user[ClaimNames.name] : 'unknown_user';
    const userEmail = config.user ? config.user[ClaimNames.upn] : undefined;
    await this.buildAsync({
      user,
      userEmail,
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
    });
  };

  public getEditingStatus = async (): Promise<boolean> => {
    const status = await this.getEditingStatusAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
    return status ? status.hasChanges : false;
  };

  public getPublishVersions = async (): Promise<IPublishVersion[]> => {
    return await this.getPublishVersionsAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
  };

  public publish = async (config: BotConfig, label: string) => {
    const user = config.user ? config.user[ClaimNames.name] : 'unknown_user';
    await this.publishAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      user,
      tag: label,
    });
  };
}
