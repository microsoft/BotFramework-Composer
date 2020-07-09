// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ChildProcess, spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import glob from 'globby';
import rimraf from 'rimraf';
import archiver from 'archiver';
import { v4 as uuid } from 'uuid';
import AdmZip from 'adm-zip';
import portfinder from 'portfinder';
import { ComposerPluginRegistration, PublishResponse, PublishPlugin } from '@bfc/plugin-loader';

import { copyDir } from './copyDir';
import { IFileStorage } from './interface';

const stat = promisify(fs.stat);
const readDir = promisify(fs.readdir);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const removeDirAndFiles = promisify(rimraf);
const copyFile = promisify(fs.copyFile);

interface RunningBot {
  process: ChildProcess;
  port: number;
}
interface PublishConfig {
  botId: string;
  version: string;
  fullSettings: any;
  templatePath: string;
}

const isWin = process.platform === 'win32';

class LocalPublisher implements PublishPlugin<PublishConfig> {
  static runningBots: { [key: string]: RunningBot } = {};
  private readonly baseDir = path.resolve(__dirname, '../');
  private templatePath;
  private composer: ComposerPluginRegistration;

  constructor(composer: ComposerPluginRegistration) {
    this.composer = composer;
  }

  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, metadata, user): Promise<PublishResponse> => {
    const { templatePath, fullSettings } = config;
    this.templatePath = templatePath;
    const botId = project.id;
    const version = 'default';

    this.composer.log('Starting publish');

    // if enableCustomRuntime is not true, initialize the runtime code in a tmp folder
    // and export the content into that folder as well.
    if (!project.settings.runtime || project.settings.runtime.customRuntime !== true) {
      this.composer.log('Using managed runtime');
      await this.initBot(botId);
      await this.saveContent(botId, version, project.dataDir, user);
      await this.saveSkillManifests(this.getBotRuntimeDir(botId), project.dataDir);
    } else if (project.settings.runtime.path && project.settings.runtime.command) {
      // update manifst into runtime wwwroot
      await this.saveSkillManifests(project.settings.runtime.path, project.dataDir);
    } else {
      return {
        status: 400,
        result: {
          message: 'Custom runtime settings are incomplete. Please specify path and command.',
        },
      };
    }

    try {
      // start or restart the bot process
      const url = await this.setBot(botId, version, fullSettings, project.dataDir);

      return {
        status: 200,
        result: {
          id: uuid(),
          endpointURL: url,
          message: 'Local publish success.',
        },
      };
    } catch (error) {
      console.error('Error in local publish', error);
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
      return {
        status: 200,
        result: {
          message: 'Ready',
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

  private getManifestDstDir = (baseDir: string) => path.resolve(baseDir, 'azurewebapp', 'wwwroot', 'manifests');

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

  private initBot = async (botId: string) => {
    this.composer.log('Initializing bot');
    const isExist = await this.botExist(botId);
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
      await this.copyDir(this.templatePath, runtimeDir);

      try {
        // TODO ccastro: discuss with benbrown. Consider init command as template metadata. Remove azurewebapp from here.
        execSync('dotnet user-secrets init --project azurewebapp', { cwd: runtimeDir, stdio: 'pipe' });
        execSync('dotnet build', { cwd: runtimeDir, stdio: 'pipe' });
      } catch (error) {
        // delete the folder to make sure build again.
        await removeDirAndFiles(botDir);
        throw new Error(error.toString());
      }
    }
  };

  private saveContent = async (botId: string, version: string, srcDir: string, user: any) => {
    this.composer.log('Packaging bot assets');
    const dstPath = this.getDownloadPath(botId, version);
    await this.zipBot(dstPath, srcDir);
  };

  private saveSkillManifests = async (dstPath: string, srcDir: string) => {
    const manifestSrcDir = this.getManifestSrcDir(srcDir);
    const manifestDstDir = this.getManifestDstDir(dstPath);

    if (await this.dirExist(manifestDstDir)) {
      await removeDirAndFiles(manifestDstDir);
    }

    if (await this.dirExist(manifestSrcDir)) {
      this.copyDir(manifestSrcDir, manifestDstDir);
    }
  };

  // start bot in current version
  private setBot = async (botId: string, version: string, settings: any, project: any = undefined) => {
    // get port, and stop previous bot if exist
    let port;
    if (LocalPublisher.runningBots[botId]) {
      this.composer.log('Bot already running. Stopping bot...');
      port = LocalPublisher.runningBots[botId].port;
      this.stopBot(botId);
    } else {
      port = await portfinder.getPortPromise({ port: 3979, stopPort: 5000 });
    }

    // if not using custom runtime, update assets in tmp older
    if (!settings.runtime || settings.runtime.customRuntime !== true) {
      this.composer.log('Updating bot assets');
      await this.restoreBot(botId, version);
    }

    // start the bot process
    try {
      await this.startBot(botId, port, settings);
      return `http://localhost:${port}`;
    } catch (error) {
      this.stopBot(botId);
      throw error;
    }
  };

  private startBot = async (botId: string, port: number, settings: any): Promise<string> => {
    const botDir =
      settings.runtime && settings.runtime.customRuntime === true
        ? settings.runtime.path
        : this.getBotRuntimeDir(botId);
    const commandAndArgs =
      settings.runtime && settings.runtime.customRuntime === true
        ? settings.runtime.command.split(/\s+/)
        : ['dotnet', 'run', '--project', 'azurewebapp']; //TODO: ccastro should pick up the bot start command here. After, remove azurewebapp arg

    return new Promise((resolve, reject) => {
      // ensure the specified runtime path exists
      if (!fs.existsSync(botDir)) {
        reject(`Runtime path ${botDir} does not exist.`);
        return;
      }

      // take the 0th item off the array, leaving just the args
      this.composer.log('Starting bot on port %d. (%s)', port, commandAndArgs.join(' '));
      const startCommand = commandAndArgs.shift();
      let process;
      try {
        process = spawn(
          startCommand,
          [...commandAndArgs, `--urls`, `http://0.0.0.0:${port}`, ...this.getConfig(settings)],
          {
            cwd: botDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: !isWin, // detach in non-windows
          }
        );
        this.composer.log('Started process %d', process.pid);
      } catch (err) {
        return reject(err);
      }
      LocalPublisher.runningBots[botId] = { process: process, port: port };
      const processLog = this.composer.log.extend(process.pid);
      this.addListeners(process, processLog, resolve, reject);
    });
  };

  private getConfig = (config: any) => {
    const configList: string[] = [];
    if (config.MicrosoftAppPassword) {
      configList.push('--MicrosoftAppPassword');
      configList.push(config.MicrosoftAppPassword);
    }
    if (config.luis) {
      configList.push('--luis:endpointKey');
      configList.push(config.luis.endpointKey || config.luis.authoringKey);
    }
    return configList;
  };

  private addListeners = (
    child: ChildProcess,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: (...args: any[]) => void,
    resolve: Function,
    reject: Function
  ) => {
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

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(erroutput);
      }
    });

    child.on('error', (err) => {
      logger('error: %s', err.message);
      reject(`Could not launch bot runtime process: ${err.message}`);
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
    const files = await glob('**/*', { cwd: srcDir, dot: true, ignore: ['runtime'] });
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dstPath);
      archive.pipe(output);

      for (const file of files) {
        archive.append(fs.createReadStream(path.join(srcDir, file)), { name: file });
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

  private stopBot = (botId: string) => {
    const proc = LocalPublisher.runningBots[botId]?.process;

    if (proc) {
      this.composer.log('Killing process %d', -proc.pid);
      // Kill the bot process AND all child processes
      try {
        process.kill(isWin ? proc.pid : -proc.pid);
      } catch (err) {
        // ESRCH means pid not found
        // this throws an error but doesn't indicate failure for us
        if (err.code !== 'ESRCH') {
          throw err;
        }
      }
    }
    delete LocalPublisher.runningBots[botId];
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

export default async (composer: ComposerPluginRegistration): Promise<void> => {
  const publisher = new LocalPublisher(composer);
  // register this publishing method with Composer
  await composer.addPublishMethod(publisher);

  // register the bundled c# runtime used by the local publisher with the eject feature
  composer.addRuntimeTemplate({
    key: 'azurewebapp',
    name: 'C#',
    startCommand: 'dotnet run --project azurewebapp',
    eject: async (project, localDisk: IFileStorage) => {
      const sourcePath = path.resolve(__dirname, '../../../../runtime/dotnet');
      const destPath = path.join(project.dir, 'runtime');
      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage);
        const schemaDstPath = path.join(project.dir, 'schemas');
        const schemaSrcPath = path.join(sourcePath, 'azurewebapp/schemas');
        const customSchemaExists = fs.existsSync(schemaDstPath);
        const pathsToExclude: Set<string> = new Set();
        if (customSchemaExists) {
          const sdkExcludePath = await localDisk.glob('sdk.schema', schemaSrcPath);
          if (sdkExcludePath.length > 0) {
            pathsToExclude.add(path.join(schemaSrcPath, sdkExcludePath[0]));
          }
        }
        await copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
        const schemaFolderInRuntime = path.join(destPath, 'azurewebapp/schemas');
        await removeDirAndFiles(schemaFolderInRuntime);
        return destPath;
      }
      throw new Error(`Runtime already exists at ${destPath}`);
    },
  });
};

// stop all the runningBot when process exit
const cleanup = () => {
  LocalPublisher.stopAll();
  process.exit(0);
};

(['SIGINT', 'SIGTERM', 'SIGQUIT'] as NodeJS.Signals[]).forEach((signal: NodeJS.Signals) => {
  process.on(signal, cleanup.bind(null, signal));
});
