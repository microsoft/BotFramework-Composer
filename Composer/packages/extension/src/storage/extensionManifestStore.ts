// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionMap, ExtensionMetadata } from '@botframework-composer/types';

import logger from '../logger';

import { Store, IStore } from './store';
import { MemoryStore } from './memoryStore';

const log = logger.extend('extensions');

export type ExtensionManifest = ExtensionMap;

const DEFAULT_MANIFEST: ExtensionManifest = {};

/** In-memory representation of extensions.json */
export class ExtensionManifestStore {
  private manifest: ExtensionManifest;
  private store: IStore<ExtensionManifest>;

  constructor(private manifestPath: string, store?: IStore<ExtensionManifest>) {
    this.store = store ?? this.getDefaultStore();
    this.manifest = this.store.read();

    // remove extensions key from existing manifests
    // TODO: remove in the future
    /* istanbul ignore next */
    if (this.manifest && this.manifest.extensions) {
      this.store.write((this.manifest.extensions as unknown) as ExtensionManifest);
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
    this.store.write(this.manifest);
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
    this.store.write(this.manifest);
  }

  public reload() {
    this.store.reload();
  }

  private getDefaultStore() {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'test') {
      return new MemoryStore(DEFAULT_MANIFEST);
    }

    return new Store(this.manifestPath, DEFAULT_MANIFEST, log);
  }
}
