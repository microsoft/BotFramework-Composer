///<reference path='../../../types/commands.d.ts'/>.
import { handlerAsync as buildAsync } from 'commands/build';
import { resolve } from 'path';

import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector } from './interface';

export class SelfHostBotConnector implements IBotConnector {
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
    await buildAsync({
      user,
      userEmail,
      dest: resolve(process.env['HOME']!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
    });
  };
}
