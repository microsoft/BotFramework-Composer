// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import max from 'lodash/max';
import portfinder from 'portfinder';

import glob from 'globby';
import rimraf from 'rimraf';
import archiver from 'archiver';
import { v4 as uuid } from 'uuid';
import AdmZip from 'adm-zip';
import { DialogSetting, PublishPlugin, IExtensionRegistration } from '@botframework-composer/types';

import killPort from 'kill-port';
import map from 'lodash/map';
import range from 'lodash/range';
import * as tcpPortUsed from 'tcp-port-used';

const stat = promisify(fs.stat);
const readDir = promisify(fs.readdir);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const removeDirAndFiles = promisify(rimraf);
const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);

interface RunningBot {
  process?: ChildProcess;
  port?: number;
  status: number;
  result: {
    message: string;
  };
}
interface PublishConfig {
  botId: string;
  version: string;
  fullSettings: any;
}

const isWin = process.platform === 'win32';

const localhostRegex = /^https?:\/\/(localhost|127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|::1)/;

const isLocalhostUrl = (matchUrl: string) => {
  return localhostRegex.test(matchUrl);
};

const isSkillHostUpdateRequired = (skillHostEndpoint?: string) => {
  return !skillHostEndpoint || isLocalhostUrl(skillHostEndpoint);
};
class LocalPublisher implements PublishPlugin<PublishConfig> {
  public name = 'localpublish';
  public description = 'Publish bot to local runtime';
  static runningBots: { [key: string]: RunningBot } = {};
  private readonly baseDir = path.resolve(__dirname, '../');
  private composer: IExtensionRegistration;

  constructor(composer: IExtensionRegistration) {
    this.composer = composer;
  }

  private setBotStatus = (botId: string, status: RunningBot) => {
    this.composer.log(`SETTING STATUS OF ${botId} to port ${status.port} and status ${status.status}`);
    // preserve the pid and port if one is available
    if (!status.process && LocalPublisher.runningBots[botId] && LocalPublisher.runningBots[botId].process) {
      status.process = LocalPublisher.runningBots[botId].process;
    }
    if (!status.port && LocalPublisher.runningBots[botId] && LocalPublisher.runningBots[botId].port) {
      status.port = LocalPublisher.runningBots[botId].port;
    }

    LocalPublisher.runningBots[botId] = status;
  };

  private publishAsync = async (botId: string, version: string, fullSettings: any, project: any, user) => {
    try {
      // if enableCustomRuntime is not true, initialize the runtime code in a tmp folder
      // and export the content into that folder as well.
      const runtime = this.composer.getRuntimeByProject(project);
      if (!project.settings.runtime || project.settings.runtime.customRuntime !== true) {
        this.composer.log('Using managed runtime');

        await this.initBot(project);
        await this.saveContent(botId, version, project.dataDir, user);
        await runtime.setSkillManifest(
          this.getBotRuntimeDir(botId),
          project.fileStorage,
          this.getManifestSrcDir(project.dataDir),
          project.fileStorage,
          'azurewebapp'
        );
      } else if (project.settings.runtime.path && project.settings.runtime.command) {
        const runtimePath = path.isAbsolute(project.settings.runtime.path)
          ? project.settings.runtime.path
          : path.resolve(project.dataDir, project.settings.runtime.path);
        await runtime.build(runtimePath, project);
        await runtime.setSkillManifest(
          project.settings.runtime.path,
          project.fileStorage,
          this.getManifestSrcDir(project.dataDir),
          project.fileStorage,
          'azurewebapp'
        );
      } else {
        throw new Error('Custom runtime settings are incomplete. Please specify path and command.');
      }
      await this.setBot(botId, version, fullSettings, project);
    } catch (error) {
      await this.stopBot(botId);
      this.setBotStatus(botId, {
        status: 500,
        result: {
          message: error.message,
        },
      });
    }
  };

  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, metadata, user): Promise<any> => {
    const { fullSettings } = config;
    const botId = project.id;
    const version = 'default';

    this.composer.log('Starting publish');

    // set the running bot status
    this.setBotStatus(botId, {
      status: 202,
      result: { message: 'Reloading...' },
    });

    try {
      // start or restart the bot process
      // do NOT await this, as it can take a long time
      this.publishAsync(botId, version, fullSettings, project, user);
      return {
        status: 202,
        result: {
          id: uuid(),
          message: 'Local publish success.',
        },
      };
    } catch (error) {
      return {
        status: 500,
        result: {
          message: error,
        },
      };
    }
  };
  getStatus = async (config: PublishConfig, project, user) => {
    const botId = project.id;
    if (LocalPublisher.runningBots[botId]) {
      if (LocalPublisher.runningBots[botId].status === 200) {
        const port = LocalPublisher.runningBots[botId].port;
        const url = `http://localhost:${port}`;
        return {
          status: 200,
          result: {
            message: 'Running',
            endpointURL: url,
          },
        };
      } else {
        const status = {
          status: LocalPublisher.runningBots[botId].status,
          result: LocalPublisher.runningBots[botId].result,
        };
        return status;
      }
    } else {
      return {
        status: 404,
        result: {
          message: 'Status cannot be obtained for this bot.',
        },
      };
    }
  };

  removeRuntimeData = async (botId: string) => {
    const targetDir = path.resolve(__dirname, `../hostedBots/${botId}`);
    if (!(await this.dirExist(targetDir))) {
      return { msg: `runtime path ${targetDir} does not exist` };
    }
    try {
      await removeDirAndFiles(targetDir);
      return { msg: `successfully removed runtime data in ${targetDir}` };
    } catch (e) {
      throw new Error(`Failed to remove ${targetDir}`);
    }
  };

  private getBotsDir = () => process.env.LOCAL_PUBLISH_PATH || path.resolve(this.baseDir, 'hostedBots');

  private getBotDir = (botId: string) => path.resolve(this.getBotsDir(), botId);

  private getBotRuntimeDir = (botId: string) => path.resolve(this.getBotDir(botId), 'runtime');

  private getBotAssetsDir = (botId: string) => path.resolve(this.getBotDir(botId));

  private getHistoryDir = (botId: string) => path.resolve(this.getBotDir(botId), 'history');

  private getManifestSrcDir = (srcDir: string) => path.resolve(srcDir, 'manifests');

  private getDownloadPath = (botId: string, version: string) =>
    path.resolve(this.getHistoryDir(botId), `${version}.zip`);

  private botExist = async (botId: string) => {
    try {
      const status = await stat(this.getBotDir(botId));
      return status.isDirectory();
    } catch (error) {
      return false;
    }
  };

  private dirExist = async (dirPath: string) => {
    try {
      const status = await stat(dirPath);
      return status.isDirectory();
    } catch (error) {
      return false;
    }
  };

  private initBot = async (project) => {
    this.composer.log('Initializing bot');
    const botId = project.id;
    const isExist = await this.botExist(botId);
    // get runtime template

    const runtime = this.composer.getRuntimeByProject(project);
    try {
      if (!isExist) {
        const botDir = this.getBotDir(botId);
        const runtimeDir = this.getBotRuntimeDir(botId);
        // create bot dir
        await mkDir(botDir, { recursive: true });
        await mkDir(runtimeDir, { recursive: true });

        // create ComposerDialogs and history folder
        mkDir(this.getBotAssetsDir(botId), { recursive: true });
        mkDir(this.getHistoryDir(botId), { recursive: true });

        // copy runtime template in folder
        this.composer.log('COPY FROM ', runtime.path, ' to ', runtimeDir);
        await this.copyDir(runtime.path, runtimeDir);
        await runtime.build(runtimeDir, project);
      } else {
        // stop bot
        await this.stopBot(botId);
        // get previous settings
        // when changing type of runtime
        const settings = JSON.parse(
          await readFile(path.resolve(this.getBotDir(botId), 'settings/appsettings.json'), {
            encoding: 'utf-8',
          })
        );
        // TODO: Understand why this is required as it would never hit this function if runtime is ejected
        if (settings.runtime?.key && (settings.runtime?.key !== project.settings.runtime?.key)) {
          // in order to change runtime type
          await removeDirAndFiles(this.getBotRuntimeDir(botId));
          // copy runtime template in folder
          await this.copyDir(runtime.path, this.getBotRuntimeDir(botId));
          await runtime.build(this.getBotRuntimeDir(botId), project);
        }
      }
    } catch (error) {
      // delete the folder to make sure build again.
      await removeDirAndFiles(this.getBotDir(botId));
      throw new Error(error.toString());
    }
  };

  private saveContent = async (botId: string, version: string, srcDir: string, user: any) => {
    this.composer.log('Packaging bot assets');
    const dstPath = this.getDownloadPath(botId, version);
    await this.zipBot(dstPath, srcDir);
  };

  // start bot in current version
  private setBot = async (botId: string, version: string, settings: any, project: any) => {
    // get port, and stop previous bot if exist
    try {
      let port;
      if (LocalPublisher.runningBots[botId]) {
        this.composer.log('Bot already running. Stopping bot...');
        // this may or may not be set based on the status of the bot
        port = LocalPublisher.runningBots[botId].port;
        await this.stopBot(botId);
      }
      if (!port) {
        // Portfinder is the stablest amongst npm libraries for finding ports. https://github.com/http-party/node-portfinder/issues/61. It does not support supplying an array of ports to pick from as we can have a race conidtion when starting multiple bots at the same time. As a result, getting the max port number out of the range and starting the range from the max.
        const maxPort = max(map(LocalPublisher.runningBots, 'port')) ?? 3979;
        port = await portfinder.getPortPromise({ port: maxPort + 1, stopPort: 6000 });
      }

      // if not using custom runtime, update assets in tmp older
      if (!settings.runtime || settings.runtime.customRuntime !== true) {
        this.composer.log('Updating bot assets');
        await this.restoreBot(botId, version);
      } else {
        // if a port (e.g. --port 5000) is configured in the custom runtime command try to parse and set this port
        if (settings.runtime.command && settings.runtime.command.includes('--port')) {
          try {
            port = /--port (\d+)/.exec(settings.runtime.command)[1];
          } catch (err) {
            console.warn(`Custom runtime command has an invalid port argument.`);
          }
        }
      }

      // start the bot process
      await this.startBot(botId, port, settings, project);
    } catch (error) {
      console.error('Error in startbot: ', error);
      await this.stopBot(botId);
      this.setBotStatus(botId, {
        status: 500,
        result: {
          message: error,
        },
      });
    }
  };

  private startBot = async (botId: string, port: number, settings: any, project: any): Promise<string> => {
    let customerRuntimePath = settings.runtime.path;
    if (customerRuntimePath && !path.isAbsolute(customerRuntimePath)) {
      customerRuntimePath = path.resolve(project.dir, customerRuntimePath);
    }
    const botDir = settings.runtime?.customRuntime === true ? customerRuntimePath : this.getBotRuntimeDir(botId);

    const commandAndArgs =
      settings.runtime?.customRuntime === true
        ? settings.runtime.command.split(/\s+/)
        : this.composer.getRuntimeByProject(project).startCommand.split(/\s+/);

    return new Promise((resolve, reject) => {
      // ensure the specified runtime path exists
      if (!fs.existsSync(botDir)) {
        reject(`Runtime path ${botDir} does not exist.`);
        return;
      }
      // take the 0th item off the array, leaving just the args
      this.composer.log('Starting bot on port %d. (%s)', port, commandAndArgs.join(' '));
      const startCommand = commandAndArgs.shift();

      let config: any[] = [];
      let skillHostEndpoint;
      if (isSkillHostUpdateRequired(settings?.skillHostEndpoint)) {
        // Update skillhost endpoint only if ngrok url not set meaning empty or localhost url
        skillHostEndpoint = `http://127.0.0.1:${port}/api/skills`;
      }
      config = this.getConfig(settings, skillHostEndpoint);
      let spawnProcess;
      try {
        spawnProcess = spawn(
          startCommand,
          [...commandAndArgs, '--port', port, `--urls`, `http://0.0.0.0:${port}`, ...config],
          {
            cwd: botDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: !isWin, // detach in non-windows
          }
        );
        this.composer.log('Started process %d', spawnProcess.pid);
        this.setBotStatus(botId, {
          process: spawnProcess,
          port,
          status: 202,
          result: { message: 'Starting runtime' },
        });

        // check if the port if ready for connecting, issue: https://github.com/microsoft/BotFramework-Composer/issues/3728
        // retry every 500ms, timeout 2min
        const retryTime = 500;
        const timeOutTime = 120000;
        const processLog = this.composer.log.extend(spawnProcess.pid);
        this.addListeners(spawnProcess, botId, processLog);

        tcpPortUsed.waitUntilUsedOnHost(port, '0.0.0.0', retryTime, timeOutTime).then(
          () => {
            this.setBotStatus(botId, {
              process: spawnProcess,
              port: port,
              status: 200,
              result: { message: 'Runtime started' },
            });
            resolve();
          },
          (err) => {
            reject(`Bot on localhost:${port} not working, error message: ${err.message}`);
          }
        );
      } catch (err) {
        reject(err);
        throw err;
      }
    });
  };

  private getConfig = (config: DialogSetting, skillHostEndpointUrl?: string): string[] => {
    const configList: string[] = [];
    if (config.MicrosoftAppPassword) {
      configList.push('--MicrosoftAppPassword');
      configList.push(config.MicrosoftAppPassword);
    }
    if (config.luis) {
      configList.push('--luis:endpointKey');
      configList.push(config.luis.endpointKey || config.luis.authoringKey);
    }
    if (config.qna.endpointKey) {
      configList.push('--qna:endpointKey');
      configList.push(config.qna.endpointKey);
    }

    if (skillHostEndpointUrl) {
      configList.push('--SkillHostEndpoint');
      configList.push(skillHostEndpointUrl);
    }

    return configList;
  };

  private removeListener = (child: ChildProcess) => {
    child.stdout.removeAllListeners('data');
    child.stderr.removeAllListeners('data');

    child.removeAllListeners('message');
    child.removeAllListeners('error');
    child.removeAllListeners('exit');
  };

  private addListeners = (
    child: ChildProcess,
    botId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: (...args: any[]) => void
  ) => {
    let erroutput = '';
    child.stdout &&
      child.stdout.on('data', (data: any) => {
        logger('%s', data.toString());
      });

    child.stderr &&
      child.stderr.on('data', (err: any) => {
        erroutput += err.toString();
      });

    child.on('exit', (code) => {
      if (code !== 0) {
        logger('error on exit: %s, exit code %d', erroutput, code);
        this.setBotStatus(botId, {
          status: 500,
          result: { message: erroutput },
        });
      }
    });

    child.on('error', (err) => {
      this.setBotStatus(botId, {
        status: 500,
        result: { message: err.message },
      });
    });

    child.on('message', (msg) => {
      logger('%s', msg);
    });
  };

  private restoreBot = async (botId: string, version: string) => {
    const srcPath = this.getDownloadPath(botId, version);
    const dstPath = this.getBotAssetsDir(botId);
    await this.unZipBot(srcPath, dstPath);
  };

  private zipBot = async (dstPath: string, srcDir: string) => {
    // delete previous and create new
    if (fs.existsSync(dstPath)) {
      await removeFile(dstPath);
    }
    const files = await glob('**/*', {
      cwd: srcDir,
      dot: true,
      ignore: ['runtime'],
    });
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dstPath);
      archive.pipe(output);

      for (const file of files) {
        archive.append(fs.createReadStream(path.join(srcDir, file)), {
          name: file,
        });
      }
      archive.finalize();
      output.on('close', () => resolve(dstPath));
      output.on('error', (err) => {
        reject(err);
      });
    });
  };

  private unZipBot = async (srcPath: string, dstPath: string) => {
    if (!fs.existsSync(srcPath)) {
      throw new Error('no such version bot');
    }
    const zip = new AdmZip(srcPath);
    zip.extractAllTo(dstPath, true);
  };

  // make it public, so that able to stop runtime before switch ejected runtime.
  public stopBot = async (botId: string) => {
    const proc = LocalPublisher.runningBots[botId]?.process;
    const port = LocalPublisher.runningBots[botId]?.port;

    if (port) {
      this.composer.log('Killing process at port %d', port);

      await new Promise((resolve, reject) => {
        setTimeout(async () => {
          killPort(port)
            .then(() => {
              this.removeListener(proc);
              delete LocalPublisher.runningBots[botId];
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        }, 1000);
      });
    }
  };

  private copyDir = async (srcDir: string, dstDir: string) => {
    if (!(await this.dirExist(srcDir))) {
      throw new Error(`no such dir ${srcDir}`);
    }
    if (!(await this.dirExist(dstDir))) {
      await mkDir(dstDir, { recursive: true });
    }
    const paths = await readDir(srcDir);
    for (const subPath of paths) {
      const srcPath = path.resolve(srcDir, subPath);
      const dstPath = path.resolve(dstDir, subPath);
      if (!(await stat(srcPath)).isDirectory()) {
        // copy files
        await copyFile(srcPath, dstPath);
      } else {
        // recursively copy dirs
        await this.copyDir(srcPath, dstPath);
      }
    }
  };

  static stopAll = () => {
    for (const botId in LocalPublisher.runningBots) {
      const bot = LocalPublisher.runningBots[botId];
      // Kill the bot process AND all child processes
      try {
        process.kill(isWin ? bot.process.pid : -bot.process.pid);
      } catch (err) {
        // swallow this error which happens if the child process is already gone
      }
      delete LocalPublisher.runningBots[botId];
    }
  };
}

export default async (composer: IExtensionRegistration): Promise<void> => {
  const publisher = new LocalPublisher(composer);
  // register this publishing method with Composer
  await composer.addPublishMethod(publisher);
};

// stop all the runningBot when process exit
const cleanup = () => {
  LocalPublisher.stopAll();
  process.exit(0);
};

(['SIGINT', 'SIGTERM', 'SIGQUIT'] as NodeJS.Signals[]).forEach((signal: NodeJS.Signals) => {
  process.on(signal, cleanup.bind(null, signal));
});
