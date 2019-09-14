///<reference path='../../../types/selfHostCommands.d.ts'/>.
import { resolve } from 'path';

import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector } from './interface';

export class SelfHostBotConnector implements IBotConnector {
  constructor() {
    this.buildAsync = require('commands/build').handlerAsync;
  }
  private buildAsync: SelfHostCommands.Build;
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
      dest: resolve(process.env['HOME']!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
    });
  };
}
