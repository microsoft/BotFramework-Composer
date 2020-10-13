// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';
import { ExtensionMap, ExtensionMetadata } from '@bfc/types';

import logger from '../logger';

const log = logger.extend('plugins');

export type ExtensionManifest = ExtensionMap;

const DEFAULT_MANIFEST: ExtensionManifest = {};

/** In-memory representation of extensions.json as well as reads / writes data to disk. */
export class ExtensionManifestStore {
  private manifest: ExtensionManifest = DEFAULT_MANIFEST;

  constructor(private manifestPath: string) {
    // create extensions.json if it doesn't exist

    if (!existsSync(this.manifestPath)) {
      log('extensions.json does not exist yet. Writing file to path: %s', this.manifestPath);
      writeJsonSync(this.manifestPath, DEFAULT_MANIFEST, { spaces: 2 });
    }

    this.readManifestFromDisk(); // load manifest into memory

    // remove extensions key from existing manifests
    // TODO: remove in the future
    /* istanbul ignore next */
    if (this.manifest && this.manifest.extensions) {
      this.manifest = (this.manifest.extensions as unknown) as ExtensionMap;
      this.writeManifestToDisk();
    }
  }

  public getExtensionConfig(id: string) {
    return this.manifest[id];
  }

  public getExtensions() {
    return this.manifest;
  }

  public removeExtension(id: string) {
    delete this.manifest[id];
    // sync changes to disk
    this.writeManifestToDisk();
  }

  // update extension config
  public updateExtensionConfig(id: string, newConfig: Partial<ExtensionMetadata>) {
    const currentConfig = this.manifest[id];

    if (currentConfig) {
      this.manifest[id] = Object.assign({}, currentConfig, newConfig);
    } else {
      this.manifest[id] = Object.assign({} as ExtensionMetadata, newConfig);
    }
    // sync changes to disk
    this.writeManifestToDisk();
  }

  public reload() {
    this.readManifestFromDisk();
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
      writeJsonSync(this.manifestPath, this.manifest, { spaces: 2 });
    } catch (e) {
      log('Error writing %s: %s', this.manifestPath, e);
    }
  }
}
