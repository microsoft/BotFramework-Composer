// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import { parse } from 'url';
import { ChildProcess, spawn } from 'child_process';

import archiver from 'archiver';

import { BotProjectService } from '../../services/project';
import { DialogSetting } from '../bot/interface';
import { Path } from '../../utility/path';
import log from '../../logger';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

const buildDebug = log.extend('build bot runtime');
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
      runtimeDebugs[pid]('successfully stopped bot runtime: %d', pid);
      runtime.kill(signal);
      delete CSharpBotConnector.botRuntimes[pid];
    }
  };

  private stop = () => {
    CSharpBotConnector.stopAll('SIGINT');
    this.status = BotStatus.NotConnected;
  };

  private buildProcess = async (dir: string): Promise<number | null> => {
    // check build file exist
    const buildScript = Path.resolve(__dirname, './build_runtime.ps1');
    const fileExisted = fs.existsSync(buildScript);
    if (!fileExisted) {
      return Promise.reject(new Error('build script not existed'));
    }
    // build bot runtime
    return new Promise((resolve, reject) => {
      const build = spawn('pwsh', [buildScript], {
        cwd: dir,
        detached: true,
        windowsHide: true,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      buildDebug('building bot runtime: %d', build.pid);
      build.stdout &&
        build.stdout.on('data', function(str) {
          buildDebug('%s', str);
        });
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
    const currentDebugger = runtimeDebugs[child.pid];
    if (child.stdout !== null) {
      child.stdout.on('data', (data: any) => {
        currentDebugger('bot runtime (%d): %s', child.pid, data);
      });
    }

    if (child.stderr !== null) {
      child.stderr.on('data', (data: any) => {
        currentDebugger('bot runtime (%d): Error %s', child.pid, data);
      });
    }

    child.on('close', code => {
      currentDebugger('close %d', code);
      handler();
    });

    child.on('error', (err: any) => {
      currentDebugger('stderr: %s', err);
    });

    child.on('exit', code => {
      currentDebugger('exit %d', code);
      handler();
    });

    child.on('message', msg => {
      currentDebugger('bot runtime received: %s', msg);
    });

    child.on('disconnect', code => {
      currentDebugger('disconnect %d', code);
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
    const runtime = spawn(
      'dotnet',
      ['bin/Debug/netcoreapp2.1/BotProject.dll', `--urls`, this.endpoint, ...this.getConnectorConfig(config)],
      {
        detached: true,
        cwd: dir,
        stdio: ['ignore', 'ignore', 'inherit'],
      }
    );
    runtimeDebugs[runtime.pid] = log.extend(`port ${runtime.pid}`);
    runtimeDebugs[runtime.pid]('bot runtime started. pid: %d', runtime.pid);
    this.addListeners(runtime, this.stop);
    CSharpBotConnector.botRuntimes[runtime.pid] = runtime;
    this.status = BotStatus.Connected;
  };

  private checkPortUsable = async (port: string | number): Promise<string> => {
    if (process.platform === 'win32') {
      return new Promise((resolve, reject) => {
        const netstat = spawn('netstat', ['-ano']);
        const findstr = spawn('findstr', [`${port}`], {
          stdio: [netstat.stdout, 'pipe', process.stderr],
        });
        let output = '';
        findstr.stderr &&
          findstr.stderr.on('data', function(err) {
            reject(err.toString());
          });
        findstr.stdout && findstr.stdout.on('data', data => (output += data));
        findstr.on('exit', function() {
          resolve(output);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        const lsof = spawn('sudo', ['lsof', '-i', `:${port}`]);
        let output = '';
        lsof.stderr && lsof.stderr.on('data', err => reject(err.toString()));
        lsof.stdout &&
          lsof.stdout.on('data', function(chunk) {
            output += chunk.toString();
          });

        lsof.on('exit', function() {
          resolve(output);
        });
      });
    }
  };

  connect = async (_: BotEnvironments, __: string) => {
    const port = parse(this.endpoint).port || '3979';
    const portStatus = await this.checkPortUsable(port);
    if (portStatus.trim() === '') {
      return Promise.resolve(`${this.endpoint}/api/messages`);
    } else {
      throw new Error(`Port ${port} already in use`);
    }
  };

  sync = async (config: DialogSetting) => {
    try {
      this.stop();
      const dir = this.getBotPath();
      await this.buildProcess(dir);
      await this.start(dir, config);
    } catch (err) {
      this.stop();
      throw err;
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

process.on('SIGINT', () => {
  CSharpBotConnector.stopAll('SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  CSharpBotConnector.stopAll('SIGTERM');
  process.exit(0);
});
process.on('SIGQUIT', () => {
  CSharpBotConnector.stopAll('SIGQUIT');
  process.exit(0);
});
