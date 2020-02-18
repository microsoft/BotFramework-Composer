// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostedEnvironment } from './hostedEnvironment';
import { DefaultEnvironment } from './defaultEnvironment';
import { MockHostedEnvironment } from './mockHostedEnvironment';

import { absHostedConfig, currentConfig, IEnvironmentConfig, IEnvironment, mockHostedConfig } from '.';
import { UserIdentity } from '@src/services/pluginLoader';

export class EnvironmentProvider {
  private static environments: { [name: string]: IEnvironment } = {};

  public static get(config: IEnvironmentConfig, user?: UserIdentity) {
    const key = this.getConfigKey(config);
    if (this.environments[key]) {
      return this.environments[key];
    }

    if (config.name === absHostedConfig.name) {
      this.environments[key] = new HostedEnvironment(config, undefined, user);
    } else if (config.name === mockHostedConfig.name) {
      this.environments[key] = new MockHostedEnvironment(config, user);
    } else {
      this.environments[key] = new DefaultEnvironment(config, user);
    }

    return this.environments[key];
  }

  public static getCurrent() {
    return this.get(currentConfig);
  }

  public static getCurrentWithOverride(args: any, user?: UserIdentity) {
    const config: any = { ...currentConfig };

    if (args) {
      Object.keys(args).forEach(key => {
        if (args[key]) {
          config[key] = args[key];
        }
      });
    }

    return this.get(config, user);
  }

  private static getConfigKey(config: IEnvironmentConfig): string {
    return `${config.name}::${config.basePath}::${config.endpoint}`;
  }
}
