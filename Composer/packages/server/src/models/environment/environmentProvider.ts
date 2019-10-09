import { HostedEnvironment } from './hostedEnvironment';
import { DefaultEnvironment } from './defaultEnvironment';

import { absHostedConfig, currentConfig, IEnvironmentConfig, IEnvironment } from '.';

export class EnvironmentProvider {
  private static environments: { [name: string]: IEnvironment } = {};

  public static get(config: IEnvironmentConfig) {
    if (this.environments[this.getConfigKey(config)]) {
      return this.environments[this.getConfigKey(config)];
    }

    if (config.name === absHostedConfig.name) {
      this.environments[this.getConfigKey(config)] = new HostedEnvironment(config);
    } else {
      this.environments[this.getConfigKey(config)] = new DefaultEnvironment(config);
    }

    return this.environments[this.getConfigKey(config)];
  }

  public static getCurrent() {
    return this.get(currentConfig);
  }

  public static getCurrentWithOverride(args: any) {
    const config: any = { ...currentConfig };

    if (args) {
      Object.keys(args).forEach(function(key) {
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
