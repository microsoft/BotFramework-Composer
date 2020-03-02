// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ChildProcess, spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import archiver from 'archiver';
import { v4 as uuid } from 'uuid';
import getPort from 'get-port';
import AdmZip from 'adm-zip';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const rmDir = promisify(fs.rmdir);
const copyFile = promisify(fs.copyFile);

interface RunningBot {
  process: ChildProcess;
  port: number;
}
interface PublishConfig {
  botId: string;
  version: string;
}

class LocalPublisher {
  static runningBots: { [key: string]: RunningBot } = {};
  private readonly baseDir = path.resolve(__dirname, '../');
  private readonly templatePath = path.resolve(__dirname, '../../../../BotProject/Templates/CSharp');
  constructor() { }
  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, user) => {
    try {
      console.log('PUBLISH ', config);
      const { botId, version } = config;
      await this.initBot(botId);
      await this.saveContent(config, project.files, user);
      const url = await this.setBot(botId, version, project.files);
      console.log(url);
      return {
        status: 200,
        result: {
          jobId: new uuid(),
          version: version,
          endpoint: url,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: 500,
        message: error.message,
      };
    }
  };
  getStatus = async config => { };
  history = async config => { };
  rollback = async (config, versionId) => { };

  private getBotsDir = () => path.resolve(this.baseDir, 'hostedBots');
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
      console.log(botDir);
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

      execSync('dotnet user-secrets init', { cwd: botDir });
      execSync('dotnet build', { cwd: botDir });
    }
  };

  private saveContent = async (config: any, project: any, user: any) => {
    const dstPath = this.getDownloadPath(config.botId, config.version);
    const zipFilePath = await this.zipBot(dstPath, project);
    console.log('zip success');
  };

  // start bot in current version
  private setBot = async (botId: string, version: string, project: any = undefined) => {
    // get port, and stop previous bot if exist
    let port;
    if (LocalPublisher.runningBots[botId]) {
      port = LocalPublisher.runningBots[botId].port;
      this.stopBot(botId);
    } else {
      port = await getPort({ host: 'localhost', port: parseInt('3979') });
    }
    await this.restoreBot(botId, version);
    try {
      await this.startBot(botId, port);
      return `http://localhost:${port}`;
    } catch (error) {
      this.stopBot(botId);
    }
  };

  private startBot = async (botId: string, port: number): Promise<string> => {
    const botDir = this.getBotDir(botId);
    return new Promise((resolve, reject) => {
      const process = spawn(
        'dotnet',
        ['bin/Debug/netcoreapp3.1/BotProject.dll', `--urls`, `http://localhost:${port}`],
        {
          cwd: botDir,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      LocalPublisher.runningBots[botId] = { process: process, port: port };
      this.addListeners(process, resolve, reject);
    });
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
  private zipBot = async (dstPath: string, project: any) => {
    // delete previous and create new
    if (fs.existsSync(dstPath)) {
      await removeFile(dstPath);
    }
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dstPath);
      archive.pipe(output);
      for (const f in project) {
        const file = project[f];
        // trim the beginning "ComposerDialogs"
        const name = file.relativePath.startsWith('ComposerDialogs')
          ? file.relativePath.substring(16)
          : file.relativePath;
        archive.append(file.content, { name: name });
      }
      archive.finalize();
      output.on('close', () => resolve(dstPath));
      output.on('error', err => {
        console.error('zip failed');
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
