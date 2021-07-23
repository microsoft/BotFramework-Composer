// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type PVAContentInfo = {
  content: string;
  eTag?: string; // needed?
  isDir: boolean;
  isFile: boolean;
  isWritable: boolean;
  lastModified: string;
  size: string;
};

// this is an in-memory representation of a PVA bot's assets
export class PVABotModel {
  private assets: Record<string, PVAContentInfo> = {};

  // take PVA info from pvaStorage.ts and go fetch bot and map to model?
  constructor(/** pva info??? */) {
    // auth & go fetch bot
  }

  public get(filePath: string): PVAContentInfo {
    return this.assets[filePath];
  }

  public getAllPaths(): string[] {
    return Object.keys(this.assets);
  }

  public getWithPathPrefix(prefix: string): string[] {
    return Object.keys(this.assets).filter((path) => path.startsWith(prefix));
  }

  public put(filePath: string, content: string): PVAContentInfo {
    const existing = this.assets[filePath];
    if (!existing) {
      // we are writing a new asset
      const newAsset: PVAContentInfo = {
        content,
        isDir: true,
        isFile: true, // figure out how to determine -- maybe missing extension?
        isWritable: true,
        lastModified: Date.now().toString(), // probably have to fix this to align with whatever the format is
        size: '', // determine size
      };
      this.assets[filePath] = newAsset;
      return newAsset;
    } else {
      const updated: PVAContentInfo = {
        ...existing,
        lastModified: Date.now().toString(), // probably have to fix this to align with whatever the format is
        content,
        // update eTag / size?
      };
      this.assets[filePath] = updated;
      return updated;
    }
  }

  public delete(filePath: string): void {
    delete this.assets[filePath];
  }
}
