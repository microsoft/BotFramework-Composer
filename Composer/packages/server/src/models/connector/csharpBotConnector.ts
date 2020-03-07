// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parse as urlParse } from 'url';
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';

import getPort from 'get-port';

import envSettings from '../../settings';
import { BotProjectService } from '../../services/project';
import { DialogSetting } from '../bot/interface';
import { Path } from '../../utility/path';
import log from '../../logger';
import AssetService from '../../services/asset';
import { IFileStorage } from '../storage/interface';
import { currentConfig } from '../environment';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

const debug = log.extend('bot-runtime');
const buildDebug = debug.extend('build');
const runtimeDebugs: { [key: string]: debug.Debugger } = {};
export class CSharpBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;
  private endpoint: string;
  static botRuntimes: { [key: string]: ChildProcess } = {};
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  static stopAll = (signal: string) => {
    for (const pid in CSharpBotConnector.botRuntimes) {
      const runtime = CSharpBotConnector.botRuntimes[pid];
      runtime.kill(signal);
      runtimeDebugs[pid]('successfully stopped bot runtime');
      delete CSharpBotConnector.botRuntimes[pid];
    }
  };

  private stop = () => {
    CSharpBotConnector.stopAll('SIGINT');
    this.status = BotStatus.NotConnected;
  };

  private isOldBot = (dir: string): boolean => {
    // check bot the bot version through build script existence.
    if (process.platform === 'win32') {
      return !fs.existsSync(Path.resolve(dir, './Scripts/build_runtime.ps1'));
    } else {
      return !fs.existsSync(Path.resolve(dir, './Scripts/build_runtime.sh'));
    }
  };

  private migrateBot = async (dir: string, storage: IFileStorage) => {
    if (this.isOldBot(dir)) {
      // cover the old bot runtime with new runtime template
      await AssetService.manager.copyRuntimeTo(dir, storage);
    }
  };

  private buildProcess = async (dir: string): Promise<number | null> => {
    // build bot runtime
    return new Promise((resolve, reject) => {
      let shell = 'sh';
      let script = ['./Scripts/build_runtime.sh'];
      if (process.platform === 'win32') {
        shell = 'powershell';
        script = ['-executionpolicy', 'bypass', '-file', './Scripts/build_runtime.ps1'];
      }
      const build = spawn(`${shell}`, script, {
        cwd: dir,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let errorMsg = '';
      buildDebug('building bot runtime: %d', build.pid);
      build.stdout &&
        build.stdout.on('data', function(str) {
          buildDebug('%s', str);
        });
      build.stderr &&
        build.stderr.on('data', function(err) {
          errorMsg = errorMsg + err.toString();
        });
      build.on('exit', function(code) {
        if (code !== 0) {
          reject(errorMsg);
        } else {
          resolve(code);
        }
      });
    });
  };

  private getConnectorConfig = (config: DialogSetting) => {
    const configList: string[] = [];
    if (config.MicrosoftAppPassword) {
      configList.push('--MicrosoftAppPassword');
      configList.push(config.MicrosoftAppPassword);
    }
    if (config.luis) {
      if (config.luis.authoringKey) {
        configList.push('--luis:endpointKey');
        configList.push(config.luis.authoringKey);
      }
    }

    return configList;
  };

  private addListeners = (child: ChildProcess, handler: Function, resolve: Function, reject: Function) => {
    const currentDebugger = runtimeDebugs[child.pid];
    let erroutput = '';
    child.stdout &&
      child.stdout.on('data', (data: any) => {
        currentDebugger('%s', data);
        resolve(child.pid);
      });

    child.stderr &&
      child.stderr.on('data', (err: any) => {
        erroutput += err.toString();
      });

    child.on('exit', code => {
      currentDebugger('exit %d', code);
      handler();
      if (code !== 0) {
        currentDebugger('exit %d: %s', code, erroutput);
        reject(erroutput);
      }
    });

    child.on('message', msg => {
      currentDebugger('%s', msg);
    });
  };

  private getBotPathAndStorage = () => {
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    return { dir: Path.join(currentProject.dir), storage: currentProject.fileStorage };
  };

  private start = async (dir: string, config: DialogSetting): Promise<string> => {
    return new Promise((resolve, reject) => {
      const runtime = spawn(
        'dotnet',
        [
          `bin/Debug/${envSettings.runtimeFrameworkVersion}/BotProject.dll`,
          `--urls`,
          this.endpoint,
          `--environment`,
          `development`,
          ...this.getConnectorConfig(config),
        ],
        {
          cwd: dir,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      // extend runtime debugger
      runtimeDebugs[runtime.pid] = debug.extend(`process (${runtime.pid})`);
      runtimeDebugs[runtime.pid]('bot runtime started');
      CSharpBotConnector.botRuntimes[runtime.pid] = runtime;
      this.addListeners(runtime, this.stop, resolve, reject);
    });
  };

  connect = async (_: BotEnvironments, __: string) => {
    const originPort = urlParse(this.endpoint).port;
    const port = await getPort({ host: 'localhost', port: parseInt(originPort || '3979') });
    this.endpoint = `http://localhost:${port}`;
    currentConfig.endpoint = this.endpoint;
    return `http://localhost:${port}/api/messages`;
  };

  sync = async (config: DialogSetting) => {
    try {
      this.stop();
      const { dir, storage } = this.getBotPathAndStorage();
      await this.migrateBot(dir, storage);

      await this.buildProcess(dir);
      await this.start(dir, config);
      this.status = BotStatus.Connected;
    } catch (err) {
      this.stop();
      this.status = BotStatus.NotConnected;
      throw err;
    }
  };

  getEditingStatus = (): Promise<boolean> => {
    return new Promise(resolve => {
      resolve(true);
    });
  };

  getPublishHistory = (): Promise<IPublishHistory> => {
    return new Promise(resolve => {
      resolve({
        production: undefined,
        previousProduction: undefined,
        integration: undefined,
      });
    });
  };

  publish = (_: BotConfig, __: string): Promise<void> => {
    return new Promise(resolve => {
      resolve();
    });
  };
}
const cleanup = (signal: NodeJS.Signals) => {
  CSharpBotConnector.stopAll(signal);
  process.exit(0);
};
(['SIGINT', 'SIGTERM', 'SIGQUIT'] as NodeJS.Signals[]).forEach((signal: NodeJS.Signals) => {
  process.on(signal, cleanup.bind(null, signal));
});
