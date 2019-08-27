///<reference path='../../../types/commands.d.ts'/>.
import { handlerAsync as buildAsync } from 'commands/build';
import { resolve } from 'path';

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

    await buildAsync({
      user: (config.user || 'unknown_user').replace(/\s/g, '_'),
      dest: resolve(process.env['HOME']!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
    });
  };
}
