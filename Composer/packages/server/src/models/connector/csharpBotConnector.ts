// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parse as urlParse } from 'url';
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import * as http from 'http';

import getPort from 'get-port';

import { BotProjectService } from '../../services/project';
import { DialogSetting } from '../bot/interface';
import { Path } from '../../utility/path';
import log from '../../logger';
import AssetService from '../../services/asset';
import { IFileStorage } from '../storage/interface';
import * as transport from '../../adapter/transport';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

interface BotRuntime {
  child: ChildProcess;
  address: Promise<transport.IAddress>;
  logger: debug.Debugger;
}

const debug = log.extend('bot-runtime');
const buildDebug = debug.extend('build');
export class CSharpBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;
  private endpoint: string;
  static botRuntimes: { [key: string]: BotRuntime } = {};
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  static stopAll = (signal: string) => {
    for (const pid in CSharpBotConnector.botRuntimes) {
      const runtime = CSharpBotConnector.botRuntimes[pid];
      runtime.child.kill(signal);
      runtime.logger('successfully stopped bot runtime');
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
      if (config.luis.authoringRegion) {
        configList.push('--luis:endpoint');
        configList.push(`https://${config.luis.authoringRegion}.api.cognitive.microsoft.com`);
      }
    }

    return configList;
  };

  private addListeners = (runtime: BotRuntime, handler: Function, resolve: Function, reject: Function) => {
    const { child, logger } = runtime;
    let erroutput = '';
    child.stdout &&
      child.stdout.on('data', (data: any) => {
        logger('%s', data);
        resolve(child.pid);
      });

    child.stderr &&
      child.stderr.on('data', (err: any) => {
        erroutput += err.toString();
      });

    child.on('exit', code => {
      logger('exit %d', code);
      handler();
      if (code !== 0) {
        logger('exit %d: %s', code, erroutput);
        reject(erroutput);
      }
    });

    child.on('message', msg => {
      logger('%s', msg);
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
    const child = spawn(
      'dotnet',
      ['bin/Debug/netcoreapp2.1/BotProject.dll', `--urls`, this.endpoint, ...this.getConnectorConfig(config)],
      {
        cwd: dir,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    // extend runtime debugger
    const logger = debug.extend(`process (${process.pid})`);
    logger('bot runtime started');

    const { started, address } = transport.outputFor(child, logger);

    // wait until the server has started
    await started;

    // poke the bot to instantiate the debug adapter
    await http.get(`${this.endpoint}/api/messages`);

    const runtime: BotRuntime = { child, logger, address };
    CSharpBotConnector.botRuntimes[process.pid] = runtime;
    return new Promise((resolve, reject) => {
      this.addListeners(runtime, this.stop, resolve, reject);
    });
  };

  connect = async (_: BotEnvironments, __: string) => {
    const originPort = urlParse(this.endpoint).port;
    const port = await getPort({ host: 'localhost', port: parseInt(originPort || '3979') });
    this.endpoint = `http://localhost:${port}`;
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

  getDebugger = async (): Promise<transport.IAddress | null> => {
    for (const pid in CSharpBotConnector.botRuntimes) {
      const runtime = CSharpBotConnector.botRuntimes[pid];
      return await runtime.address;
    }

    return null;
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
