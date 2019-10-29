/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
