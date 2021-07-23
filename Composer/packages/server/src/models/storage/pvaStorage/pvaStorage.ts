// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFileStorage, Stat, MakeDirectoryOptions } from '../interface';

import { PVABotModel } from './pvaBotModel';

export class PVAStorage implements IFileStorage {
  // some internal model that represents the bot's assets
  private model: PVABotModel;

  // maybe go grab the bot from PVA?
  constructor(/** PVA info here...? */) {
    this.model = new PVABotModel(/** pva info... */);
  }

  stat(path: string): Promise<Stat> {
    return new Promise((resolve, reject) => {
      resolve(this.model.get(path));
    });
  }

  statSync(path: string): Stat {
    return this.model.get(path);
  }

  readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve(this.model.get(path).content);
    });
  }

  readFileSync(path: string): string {
    return this.model.get(path).content;
  }

  readDir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      resolve(this.model.getWithPathPrefix(path));
    });
  }

  readDirSync(path: string): string[] {
    return this.model.getWithPathPrefix(path);
  }

  exists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(!!this.model.get(path));
    });
  }

  existsSync(path: string): boolean {
    return !!this.model.get(path);
  }

  writeFile(path: string, content: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.model.put(path, content);
      resolve();
    });
  }

  writeFileSync(path: string, content: any): void {
    this.model.put(path, content);
  }

  removeFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.model.delete(path);
      resolve();
    });
  }

  removeFileSync(path: string): void {
    this.model.delete(path);
  }

  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    // no-op -- no actual representation of directories in pva model
    return Promise.resolve();
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    // no-op -- no actual representation of directories in pva model
  }

  // are these supposed to remove an empty directory?
  rmDir(path: string): Promise<void> {
    // no-op -- no actual representation of directories in pva model
    return Promise.resolve();
  }

  rmDirSync(path: string): void {
    // no-op -- no actual representation of directories in pva model
  }

  // I assume these are supposed to remove a directory and everything inside of it
  rmrfDir(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const paths = this.model.getWithPathPrefix(path);
      paths.forEach((path) => this.model.delete(path));
      resolve();
    });
  }
  rmrfDirSync(path: string): void {
    const paths = this.model.getWithPathPrefix(path);
    paths.forEach((path) => this.model.delete(path));
  }

  glob(pattern: string | string[], path: string): Promise<string[]> {
    // TODO: get all asset paths and run pattern(s) on paths
    return new Promise((resolve, reject) => {
      const paths = this.model.getAllPaths();
      // TODO: run glob pattern(s) on all paths
      // const matches = glob(pattern, paths)
      // resolve(matches)
      resolve(paths);
    });
  }

  globSync(pattern: string | string[], path: string): string[] {
    const paths = this.model.getAllPaths();
    // TODO: run glob pattern(s) on all paths
    // const matches = glob(pattern, paths)
    // resolve(matches)
    return paths;
  }

  copyFile(src: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingAsset = this.model.get(src);
      if (!existingAsset) {
        // bail out, nothing to copy
        return;
      }
      // do we have to do any check here to make sure a file isn't copied to a directory path? -- probbbly not
      this.model.put(dest, existingAsset.content);
      resolve();
    });
  }

  rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const oldAsset = this.model.get(oldPath);
      if (!oldAsset) {
        // bail out, nothing to copy
        return;
      }
      // do we have to do any check here to make sure a file isn't copied to a directory path? -- probbbly not
      this.model.put(newPath, oldAsset.content);
      this.model.delete(oldPath);
      resolve();
    });
  }

  zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown {
    // TODO
  }
}
