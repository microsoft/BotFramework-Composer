// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';

import logger from '../logger';
import { ExtensionMap, ExtensionMetadata } from '../types/extension';

const log = logger.extend('plugins');

export interface ExtensionManifest {
  extensions: ExtensionMap;
}

const DEFAULT_MANIFEST: ExtensionManifest = {
  extensions: {},
};

function omitBuiltinProperty(key: string, value: string) {
  if (key && key === 'builtIn') {
    return undefined;
  }
  return value;
}

/** In-memory representation of extensions.json as well as reads / writes data to disk. */
export class ExtensionManifestStore {
  private manifest: ExtensionManifest = DEFAULT_MANIFEST;
  private manifestPath: string;

  constructor() {
    this.manifestPath = process.env.COMPOSER_EXTENSION_DATA as string;
    // create extensions.json if it doesn't exist
    if (!existsSync(this.manifestPath)) {
      log('extensions.json does not exist yet. Writing file to path: %s', this.manifestPath);
      writeJsonSync(this.manifestPath, DEFAULT_MANIFEST, { spaces: 2 });
    }
    this.readManifestFromDisk(); // load manifest into memory
  }

  // load manifest into memory
  private readManifestFromDisk() {
    try {
      const manifest: ExtensionManifest = readJsonSync(this.manifestPath);
      this.manifest = manifest;
    } catch (e) {
      log('Error reading %s: %s', this.manifestPath, e);
    }
  }

  // write manifest from memory to disk
  private writeManifestToDisk() {
    try {
      writeJsonSync(this.manifestPath, this.manifest, { replacer: omitBuiltinProperty, spaces: 2 });
    } catch (e) {
      log('Error writing %s: %s', this.manifestPath, e);
    }
  }

  public getExtensionConfig(id: string) {
    return this.manifest.extensions[id];
  }

  public getExtensions() {
    return this.manifest.extensions;
  }

  public removeExtension(id: string) {
    delete this.manifest.extensions[id];
    // sync changes to disk
    this.writeManifestToDisk();
  }

  // update extension config
  public updateExtensionConfig(id: string, newConfig: Partial<ExtensionMetadata>) {
    const currentConfig = this.manifest.extensions[id];

    if (currentConfig) {
      this.manifest.extensions[id] = Object.assign(currentConfig, newConfig);
    } else {
      this.manifest.extensions[id] = Object.assign({} as ExtensionMetadata, newConfig);
    }
    // sync changes to disk
    this.writeManifestToDisk();
  }
}
