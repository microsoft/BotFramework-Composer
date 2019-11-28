// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import { ChildProcess, spawn } from 'child_process';

import archiver from 'archiver';

import { BotProjectService } from '../../services/project';
import { DialogSetting } from '../bot/interface';
import { Path } from '../../utility/path';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

export class CSharpBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;
  private endpoint: string;
  private runtime: ChildProcess | null = null;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.addProcessListeners();
  }

  private addProcessListeners = () => {
    process.on('SIGINT', () => {
      console.log('[SIGINT] start graceful shutdown');
      this.stop();
      process.exit(1);
    });
    process.on('SIGTERM', () => {
      console.log('[SIGTERM] start graceful shutdown');
      this.stop();
      process.exit(1);
    });
    process.on('SIGQUIT', () => {
      console.log('[SIGQUIT] start graceful shutdown');
      this.stop();
      process.exit(1);
    });
  };

  private stop = () => {
    if (this.runtime) {
      console.log(`kill this bot with process PID: ${this.runtime.pid}`);
      this.runtime.kill('SIGKILL');
      this.runtime = null;
    }
  };

  private buildProcess = async (dir: string): Promise<number | null> => {
    return new Promise((resolve, reject) => {
      const startScript = Path.resolve(dir, './Scripts/build_runtime.ps1');
      console.log(startScript);
      const build = spawn(`pwsh ${startScript}`, {
        cwd: dir,
        detached: true,
        shell: true,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      console.log(`build pid : ${build.pid}`);

      build.stderr &&
        build.stderr.on('data', function(err) {
          reject(err.toString());
        });

      build.on('exit', function(code) {
        resolve(code);
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
  private addListeners = (child: ChildProcess, handler: Function) => {
    if (child.stdout !== null) {
      child.stdout.on('data', (data: any) => {
        console.log(`stdout: ${data}`);
      });
    }

    if (child.stderr !== null) {
      child.stderr.on('data', (data: any) => {
        console.log(`stderr: ${data}`);
      });
    }

    child.on('close', code => {
      console.log(`close ${code}`);
      handler();
    });

    child.on('error', (err: any) => {
      console.log(`stderr: ${err}`);
    });

    child.on('exit', code => {
      console.log(`exit: ${code}`);
      handler();
    });

    child.on('message', msg => {
      console.log(msg);
    });

    child.on('disconnect', code => {
      console.log(`disconnect: ${code}`);
      handler();
    });
  };

  private getBotPath = () => {
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    return Path.join(currentProject.dir);
  };

  private start = async (dir: string, config: DialogSetting) => {
    this.runtime = spawn(
      'dotnet',
      ['bin/Debug/netcoreapp2.1/BotProject.dll', `--urls`, this.endpoint, ...this.getConnectorConfig(config)],
      {
        detached: true,
        cwd: dir,
        stdio: ['ignore', 'ignore', 'inherit'],
      }
    );
    console.log(`start runtime at ${this.runtime.pid}`);
    this.addListeners(this.runtime, this.stop);
  };

  connect = async (_: BotEnvironments, __: string) => {
    // confirm bot runtime is listening here
    return Promise.resolve(`${this.endpoint}/api/messages`);
  };

  sync = async (config: DialogSetting) => {
    try {
      this.stop();
      const dir = this.getBotPath();
      await this.buildProcess(dir);
      await this.start(dir, config);
    } catch (err) {
      this.stop();
      throw new Error(err);
    }
  };

  archiveDirectory = (src: string, dest: string) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dest);

      archive.pipe(output);
      archive.directory(src, false);
      archive.finalize();

      output.on('close', () => resolve(archive));
      archive.on('error', err => reject(err));
    });
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
