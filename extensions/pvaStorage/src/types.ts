// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * PVA API Types
 */

export type ComponentInfo = {
  c: string;
  v: number;
};

export type ObiFileModification = {
  componentInfo: ComponentInfo;
  fileContent: string;
  isDeleted: boolean;
  path: string;
};

export type BotComponentResponse = {
  contentSnapshot: string;

  /** Contains the list of created, updated or deleted obi components for consumption by Composer code */
  obiFileChanges: ObiFileModification[];
};

export type BotComponentUpsertRequest = {
  obiFileChanges: ObiFileModification[];
};

export type ContentUpdateMetadata = {
  content?: string;
  isDelete: boolean;
};

export type CachedPVABot = {
  obiContentMap: Record<string, ComponentInfo>;
  mostRecentContentSnapshot: string;
  trackedUpdates: Record<string, ContentUpdateMetadata>;
};

/**
 * Composer File Storage Interface
 */

export interface Stat {
  isDir: boolean;
  isFile: boolean;
  isWritable: boolean;
  lastModified: string;
  size: string;
}

export interface MakeDirectoryOptions {
  recursive?: boolean;
}

export interface IFileStorage {
  stat(path: string): Promise<Stat>;
  statSync(path: string): Stat;
  readFile(path: string): Promise<string>;
  readFileSync(path: string): string;
  readDir(path: string): Promise<string[]>;
  readDirSync(path: string): string[];
  exists(path: string): Promise<boolean>;
  existsSync(path: string): boolean;
  writeFile(path: string, content: any): Promise<void>;
  writeFileSync(path: string, content: any): void;
  removeFile(path: string): Promise<void>;
  removeFileSync(path: string): void;
  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
  mkDirSync(path: string, options?: MakeDirectoryOptions): void;
  rmDir(path: string): Promise<void>;
  rmDirSync(path: string): void;
  rmrfDir(path: string): Promise<void>;
  rmrfDirSync(path: string): void;
  glob(pattern: string | string[], path: string): Promise<string[]>;
  globSync(pattern: string | string[], path: string): string[];
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown;
  initialize?(projectId: string): Promise<void>;
}
