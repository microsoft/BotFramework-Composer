// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { basename, format } from 'path';

import fs, { ensureDir, ensureDirSync } from 'fs-extra';
import rimraf from 'rimraf';
import globby from 'globby';
import archiver from 'archiver';
import { FileExtensions } from '@botframework-composer/types';

import { BotProjectMetadata, IFileStorage, Stat } from './types';
import { PVABotClient } from './pvaBotClient';

/* eslint-disable security/detect-non-literal-fs-filename */
export class PVAStorage implements IFileStorage {
  private botClient: PVABotClient;
  /** The storage plugin is used globally across the app for reads / writes regardless
   * of whether there is a bot open. This flag will keep track of when we are performing
   * storage operations in context of the bot.
   */
  private hasBotContext = false;

  constructor(conn, user, id?: string, metadata?: BotProjectMetadata) {
    if (id && metadata) {
      console.log(`Instantiating PVAStorage for project ${id}`);
      console.log(metadata);
      this.hasBotContext = true;
      this.botClient = new PVABotClient(id, metadata);
    }
  }

  async initialize(electronContext: any, botDir: string): Promise<void> {
    // we only need to go fetch the bot from PVA if we are operating on a bot
    if (this.hasBotContext) {
      await this.botClient.initialize(electronContext, botDir);
    }
  }

  async stat(path: string): Promise<Stat> {
    const fstat = await fs.stat(path);
    // test to see if this file is writable
    let writable = true;
    try {
      fs.accessSync(path, fs.constants.W_OK); // lgtm [js/path-injection]
    } catch (err) {
      writable = false;
    }
    return {
      isDir: fstat.isDirectory(),
      isFile: fstat.isFile(),
      isWritable: writable,
      lastModified: fstat.mtime.toString(),
      size: fstat.isFile() ? fstat.size.toString() : '',
    };
  }

  statSync(path: string): Stat {
    const fstat = fs.statSync(path);
    // test to see if this file is writable
    let writable = true;
    try {
      fs.accessSync(path, fs.constants.W_OK); // lgtm [js/path-injection]
    } catch (err) {
      writable = false;
    }
    return {
      isDir: fstat.isDirectory(),
      isFile: fstat.isFile(),
      isWritable: writable,
      lastModified: fstat.mtime.toString(),
      size: fstat.isFile() ? fstat.size.toString() : '',
    };
  }

  async readFile(path: string): Promise<string> {
    const raw = await fs.readFile(path, 'utf-8');
    return raw.replace(/^\uFEFF/, ''); // UTF-8 BOM: https://github.com/nodejs/node-v0.x-archive/issues/1918
  }

  readFileSync(path: string): string {
    const raw = fs.readFileSync(path, 'utf-8');
    return raw.replace(/^\uFEFF/, ''); // UTF-8 BOM: https://github.com/nodejs/node-v0.x-archive/issues/1918
  }

  async readDir(path: string): Promise<string[]> {
    return await fs.readdir(path);
  }

  readDirSync(path: string): string[] {
    return fs.readdirSync(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  existsSync(path: string): boolean {
    try {
      fs.statSync(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async writeFile(path: string, content: any): Promise<void> {
    await fs.writeFile(path, content);
    if (this.hasBotContext) {
      this.botClient.trackWrite(path, content);
    }
  }

  writeFileSync(path: string, content: any): void {
    fs.writeFileSync(path, content);
    if (this.hasBotContext) {
      this.botClient.trackWrite(path, content);
    }
  }

  async removeFile(path: string): Promise<void> {
    await fs.unlink(path);
    if (this.hasBotContext) {
      this.botClient.trackDelete(path);
    }
  }

  removeFileSync(path: string): void {
    fs.unlinkSync(path);
    if (this.hasBotContext) {
      this.botClient.trackDelete(path);
    }
  }

  async mkDir(path: string): Promise<void> {
    await ensureDir(path);
  }

  mkDirSync(path: string): void {
    ensureDirSync(path);
  }

  async rmDir(path: string): Promise<void> {
    await fs.rmdir(path);
  }

  rmDirSync(path: string): void {
    fs.rmdirSync(path);
  }

  async rmrfDir(path: string): Promise<void> {
    await new Promise((resolve, reject) => {
      try {
        rimraf(path);
        resolve(null);
      } catch (e) {
        reject(e);
      }
    });
  }

  rmrfDirSync(path: string): void {
    rimraf.sync(path);
  }

  async glob(pattern: string | string[], path: string): Promise<string[]> {
    return await globby(pattern, { cwd: path, dot: true });
  }

  globSync(pattern: string | string[], path: string): string[] {
    return globby.sync(pattern, { cwd: path, dot: true });
  }

  async copyFile(src: string, dest: string): Promise<void> {
    await fs.copyFile(src, dest);
    const fileContent = await this.readFile(dest);
    if (this.hasBotContext) {
      this.botClient.trackWrite(dest, fileContent);
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await fs.rename(oldPath, newPath);
    const fileContent = await this.readFile(newPath);
    if (this.hasBotContext) {
      this.botClient.trackWrite(newPath, fileContent);
      this.botClient.trackDelete(oldPath);
    }
  }

  async zip(source: string, exclusions, cb): Promise<void> {
    const defaultDirectories = [
      '/Controllers/',
      '/dialogs/',
      '/form-dialogs/',
      '/knowledge-base/',
      '/language-generation/',
      '/language-understanding/',
      '/media/',
      '/Properties/',
      '/recognizers/',
      '/schemas/',
      '/scripts/',
      '/settings/',
      '/wwwroot/',
      '/generated/',
    ];

    const directoriesToInclude = defaultDirectories.filter((elem) => {
      return exclusions?.directories == undefined || exclusions?.directories?.indexOf(elem) == -1;
    });

    const defaultFiles = [
      `*${FileExtensions.BotProject}`,
      `*${FileExtensions.Dialog}`,
      `*.csproj`,
      `*.cs`,
      `*.js`,
      `*.json`,
      `Nuget.config`,
      'web.config',
      'README.md',
      '.gitignore',
    ];

    const filesToInclude = defaultFiles.filter((elem) => {
      return exclusions?.files == undefined || exclusions?.files?.indexOf(elem) == -1;
    });

    const archive = archiver('zip');
    cb(archive);

    // We're selectively adding specific directories/files to the archive.
    // If a user has ejected the runtime into the path, we don't want to include
    // these files into the archive
    const directoriesForArchive = directoriesToInclude.map((elem) => {
      return format({ dir: `${source}${elem}` });
    });

    directoriesForArchive.forEach((directory) => {
      archive.directory(directory, directory.split(source)[1]);
    });

    const files = await globby(filesToInclude, { cwd: source, dot: true });
    files.forEach((file) => {
      archive.file(format({ dir: `${source}/`, base: `${file}` }), { name: basename(file) });
    });

    archive.finalize();
  }

  async autoSave(): Promise<void> {
    await this.botClient.saveToPVA();
  }
}
