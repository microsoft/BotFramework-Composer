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

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const rmDir = promisify(rimraf);
const copyFile = promisify(fs.copyFile);

interface RunningBot {
  process: ChildProcess;
  port: number;
}
interface PublishConfig {
  botId: string;
  version: string;
  settings: any;
  templatePath: string;
}

class LocalPublisher {
  static runningBots: { [key: string]: RunningBot } = {};
  private readonly baseDir = path.resolve(__dirname, '../');
  private templatePath;

  constructor() { }
  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, user) => {
    const { settings, templatePath } = config;
    this.templatePath = templatePath;
    const botId = project.id;
    const version = 'default';
    await this.initBot(botId);
    await this.saveContent(botId, version, project.dataDir, user);
    const url = await this.setBot(botId, version, settings, project.dataDir);
    return {
      status: 200,
      result: {
        jobId: new uuid(),
        version: version,
        endpoint: url,
      },
    };
  };
  getStatus = async (botId: string) => {
    if (LocalPublisher.runningBots[botId]) {
      return {
        botStatus: 'connected',
      };
    } else {
      return {
        botStatus: 'unConnected',
      };
    }
  };
  history = async config => { };
  rollback = async (config, versionId) => { };

  private getBotsDir = () => process.env.LOCAL_PUBLISH_PATH || path.resolve(this.baseDir, 'hostedBots');
  private getBotDir = (botId: string) => path.resolve(this.getBotsDir(), botId);
  private getBotAssetsDir = (botId: string) => path.resolve(this.getBotDir(botId), 'ComposerDialogs');
  private getHistoryDir = (botId: string) => path.resolve(this.getBotDir(botId), 'history');
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
    const isExist = await this.botExist(botId);
    if (!isExist) {
      const botDir = this.getBotDir(botId);
      // create bot dir
      await mkDir(botDir, { recursive: true });
      // copy runtime template in folder
      await this.copyDir(this.templatePath, botDir);
      // unzip runtime template to bot folder
      // const zip = new AdmZip(this.templatePath);
      // zip.extractAllTo(botDir, true);

      // create ComposerDialogs and histroy folder
      mkDir(this.getBotAssetsDir(botId), { recursive: true });
      mkDir(this.getHistoryDir(botId), { recursive: true });
      try {
        execSync('dotnet user-secrets init', { cwd: botDir });
        execSync('dotnet build', { cwd: botDir });
      } catch (error) {
        // delete the folder to make sure build again.
        rmDir(botDir);
        throw new Error(error.toString());
      }
    }
  };

  private saveContent = async (botId: string, version: string, srcDir: string, user: any) => {
    const dstPath = this.getDownloadPath(botId, version);
    const zipFilePath = await this.zipBot(dstPath, srcDir);
  };

  // start bot in current version
  private setBot = async (botId: string, version: string, settings: any, project: any = undefined) => {
    // get port, and stop previous bot if exist
    let port;
    if (LocalPublisher.runningBots[botId]) {
      port = LocalPublisher.runningBots[botId].port;
      this.stopBot(botId);
    } else {
      port = await portfinder.getPortPromise({ port: 3979, stopPort: 5000 });
    }
    await this.restoreBot(botId, version);
    try {
      await this.startBot(botId, port, settings);
      return `http://localhost:${port}`;
    } catch (error) {
      this.stopBot(botId);
    }
  };

  private startBot = async (botId: string, port: number, settings: any): Promise<string> => {
    const botDir = this.getBotDir(botId);
    return new Promise((resolve, reject) => {
      const process = spawn(
        'dotnet',
        ['bin/Debug/netcoreapp3.1/BotProject.dll', `--urls`, `http://0.0.0.0:${port}`, ...this.getConfig(settings)],
        {
          cwd: botDir,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      LocalPublisher.runningBots[botId] = { process: process, port: port };
      this.addListeners(process, resolve, reject);
    });
  };
  private getConfig = (config: any) => {
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
  private addListeners = (child: ChildProcess, resolve: Function, reject: Function) => {
    let erroutput = '';
    child.stdout &&
      child.stdout.on('data', (data: any) => {
        resolve(child.pid);
      });

    child.stderr &&
      child.stderr.on('data', (err: any) => {
        erroutput += err.toString();
      });

    child.on('exit', code => {
      if (code !== 0) {
        reject(erroutput);
      }
    });

    child.on('message', msg => {
      console.log(msg);
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
    const files = await glob('**/*', { cwd: srcDir, dot: true });
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dstPath);
      archive.pipe(output);

      for (const file of files) {
        archive.append(fs.createReadStream(path.join(srcDir, file)), { name: file });
      }
      archive.finalize();
      output.on('close', () => resolve(dstPath));
      output.on('error', err => {
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
    LocalPublisher.runningBots[botId]?.process.kill('SIGKILL');
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
      bot.process.kill('SIGKILL');
      delete LocalPublisher.runningBots[botId];
    }
  };
}

const publisher = new LocalPublisher();
export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(publisher);
};

// stop all the runningBot when process exit
const cleanup = (signal: NodeJS.Signals) => {
  LocalPublisher.stopAll();
  process.exit(0);
};
(['SIGINT', 'SIGTERM', 'SIGQUIT'] as NodeJS.Signals[]).forEach((signal: NodeJS.Signals) => {
  process.on(signal, cleanup.bind(null, signal));
});
