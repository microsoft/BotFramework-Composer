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
const rename = promisify(fs.rename);

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
  private readonly baseDir = './';
  private readonly templatePath = path.resolve(this.baseDir, 'template', 'CSharp');
  constructor() { }
  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, user) => {
    try {
      console.log('PUBLISH ', config);
      const { botId, version } = config;
      await this.initBot(botId);
      await this.saveContent(config, project, user);
      const url = await this.setBot(botId, version, project);

      return {
        status: 200,
        result: {
          jobId: new uuid(),
          version: version,
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
    const status = await stat(this.getBotDir(botId));
    return status.isDirectory();
  };

  private initBot = async (botId: string) => {
    if (!this.botExist(botId)) {
      const botDir = this.getBotDir(botId);
      // create bot dir
      await mkDir(botDir);
      // copy runtime template in folder
      await this.copyDir(this.templatePath, botDir);
      // create ComposerDialogs and histroy folder
      mkDir(this.getBotAssetsDir(botId));
      mkDir(this.getHistoryDir(botId));

      execSync('dotnet user-secrets init', { cwd: botDir });
      execSync('dotnet build', { cwd: botDir });
    }
  };

  private saveContent = async (config: any, project: any, user: any) => {
    const dstPath = this.getDownloadPath(config.botId, config.version);
    await this.zipBot(dstPath, project);
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
    const dstPath = this.getDownloadPath(botId, version);
    await this.unZipBot(dstPath);
  };
  private zipBot = async (dstPath: string, project: any) => {
    // delete previous and create new
    if ((await stat(dstPath)).isFile) {
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
      output.on('error', err => reject(err));
    });
  };

  private unZipBot = async (dstPath: string) => {
    if (!(await stat(dstPath)).isFile) {
      throw new Error('no such version bot');
    }
    const zip = new AdmZip(dstPath);
    zip.extractAllTo(this.getBotAssetsDir, true);
  };

  private stopBot = (botId: string) => {
    LocalPublisher.runningBots[botId]?.process.kill('SIGKILL');
    delete LocalPublisher.runningBots[botId];
  };
  private copyDir = async (srcDir: string, dstDir: string) => {
    if (!(await stat(srcDir)).isDirectory) {
      throw new Error(`no such dir ${srcDir}`);
    }
    if (!(await stat(dstDir)).isDirectory) {
      await mkDir(dstDir, { recursive: true });
    }
    const paths = await readDir(srcDir);
    for (const path of paths) {
      const srcPath = `${srcDir}/${path}`;
      const dstPath = `${dstDir}/${path}`;
      if ((await stat(srcPath)).isFile) {
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
