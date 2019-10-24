import { HostedEnvironment } from './hostedEnvironment';
import { DefaultEnvironment } from './defaultEnvironment';
import { MockHostedEnvironment } from './mockHostedEnvironment';

import { absHostedConfig, currentConfig, IEnvironmentConfig, IEnvironment, mockHostedConfig } from '.';

export class EnvironmentProvider {
  private static environments: { [name: string]: IEnvironment } = {};

  public static get(config: IEnvironmentConfig) {
    const key = this.getConfigKey(config);
    if (this.environments[key]) {
      return this.environments[key];
    }

    if (config.name === absHostedConfig.name) {
      this.environments[key] = new HostedEnvironment(config);
    } else if (config.name === mockHostedConfig.name) {
      this.environments[key] = new MockHostedEnvironment(config);
    } else {
      this.environments[key] = new DefaultEnvironment(config);
    }

    return this.environments[key];
  }

  public static getCurrent() {
    return this.get(currentConfig);
  }

  public static getCurrentWithOverride(args: any) {
    const config: any = { ...currentConfig };

    if (args) {
      Object.keys(args).forEach(key => {
        if (args[key]) {
          config[key] = args[key];
        }
      });
    }

    return this.get(config);
  }

  private static getConfigKey(config: IEnvironmentConfig): string {
    return `${config.name}::${config.basePath}::${config.endpoint}`;
  }
}
