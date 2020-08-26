// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

import glob from 'globby';
import archiver from 'archiver';
import rimraf from 'rimraf';

import { IFileStorage, Stat, MakeDirectoryOptions } from './interface';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const rmDir = promisify(fs.rmdir);
const rmrfDir = promisify(rimraf);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);

export class LocalDiskStorage implements IFileStorage {
  async stat(path: string): Promise<Stat> {
    const fstat = await stat(path);
    // test to see if this file is writable
    let writable = true;
    try {
      fs.accessSync(path, fs.constants.W_OK);
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
    const raw = await readFile(path, 'utf-8');
    return raw.replace(/^\uFEFF/, ''); // UTF-8 BOM: https://github.com/nodejs/node-v0.x-archive/issues/1918
  }

  async readDir(path: string): Promise<string[]> {
    return await readDir(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async writeFile(path: string, content: any): Promise<void> {
    await writeFile(path, content);
  }

  async removeFile(path: string): Promise<void> {
    await removeFile(path);
  }

  async mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    await mkDir(path, options);
  }

  async rmDir(path: string): Promise<void> {
    await rmDir(path);
  }

  async rmrfDir(path: string): Promise<void> {
    await rmrfDir(path);
  }

  async glob(pattern: string | string[], path: string): Promise<string[]> {
    return await glob(pattern, { cwd: path, dot: true });
  }

  async copyFile(src: string, dest: string): Promise<void> {
    return await copyFile(src, dest);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return await rename(oldPath, newPath);
  }

  async zip(source: string, cb): Promise<void> {
    const archive = archiver('zip');
    cb(archive);

    // We're selectively adding specific directories/files to the archive.
    // If a user has ejected the runtime into the path, we don't want to include
    // these files into the archive
    [
      path.format({ dir: `${source}/dialogs/` }),
      path.format({ dir: `${source}/language-understanding/` }),
      path.format({ dir: `${source}/language-generation/` }),
      path.format({ dir: `${source}/settings/` }),
      path.format({ dir: `${source}/generated/` }),
      path.format({ dir: `${source}/knowledge-base/` }),
    ].forEach((directory) => {
      archive.directory(directory, directory.split(source)[1]);
    });

    const files = await glob('*.dialog', { cwd: source, dot: true });
    files.forEach((file) => {
      archive.file(path.format({ dir: `${source}/`, base: `${file}` }), { name: path.basename(file) });
    });

    archive.finalize();
  }
}
