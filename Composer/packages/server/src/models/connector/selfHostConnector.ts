//eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
///<reference path='../../../types/selfHostCommands.d.ts'/>.
import { resolve } from 'path';

import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

export class SelfHostBotConnector implements IBotConnector {
  constructor() {
    this.buildAsync = require('commands/build').handlerAsync;
    this.publishAsync = require('commands/publish').handlerAsync;
    this.getEditingStatusAsync = require('commands/editingStatus').handlerAsync;
    this.getPublishHistoryAsync = require('commands/getPublishHistory').handlerAsync;
  }
  private buildAsync: SelfHostCommands.Build;
  private publishAsync: SelfHostCommands.Publish;
  private getEditingStatusAsync: SelfHostCommands.GetEditingStatus;
  private getPublishHistoryAsync: SelfHostCommands.GetPublishHistory;
  public status: BotStatus = BotStatus.NotConnected;

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const { targetEnvironment: env } = config;
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';
    const userEmail = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.upn] : undefined;
    const accessToken = config.user ? config.user.accessToken : undefined;
    await this.buildAsync({
      user,
      userEmail,
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
      botId: undefined,
      accessToken,
    });
  };

  public getEditingStatus = async (): Promise<boolean> => {
    const status = await this.getEditingStatusAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
    return status ? status.hasChanges : false;
  };

  public getPublishHistory = async (): Promise<IPublishHistory> => {
    return await this.getPublishHistoryAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
  };

  public publish = async (config: BotConfig, label: string | undefined) => {
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';
    const userEmail = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.upn] : undefined;
    const accessToken = config.user ? config.user.accessToken : undefined;
    await this.publishAsync({
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      user,
      userEmail,
      label,
      accessToken,
      botId: undefined, // taken from the access token
    });
  };
}
