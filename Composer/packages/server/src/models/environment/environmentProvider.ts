// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from '../../services/pluginLoader';
import { BotProject } from '../bot/botProject';

import { HostedEnvironment } from './hostedEnvironment';
import { DefaultEnvironment } from './defaultEnvironment';
import { MockHostedEnvironment } from './mockHostedEnvironment';

import { absHostedConfig, currentConfig, IEnvironmentConfig, IEnvironment, mockHostedConfig } from '.';

export class EnvironmentProvider {
  private static environments: { [name: string]: IEnvironment } = {};

  public static get(config: IEnvironmentConfig, project: BotProject, user?: UserIdentity) {
    const key = this.getConfigKey(config);
    if (this.environments[key]) {
      return this.environments[key];
    }

    if (config.name === absHostedConfig.name) {
      this.environments[key] = new HostedEnvironment(config, undefined, user);
    } else if (config.name === mockHostedConfig.name) {
      this.environments[key] = new MockHostedEnvironment(config, user);
    } else {
      this.environments[key] = new DefaultEnvironment(config, project, user);
    }

    return this.environments[key];
  }

  public static getCurrent(project) {
    return this.get(currentConfig, project);
  }

  public static getCurrentWithOverride(args: any, project: BotProject, user?: UserIdentity) {
    const config: any = { ...currentConfig };

    if (args) {
      Object.keys(args).forEach(key => {
        if (args[key]) {
          config[key] = args[key];
        }
      });
    }

    return this.get(config, project, user);
  }

  private static getConfigKey(config: IEnvironmentConfig): string {
    return `${config.name}::${config.basePath}::${config.endpoint}`;
  }
}
