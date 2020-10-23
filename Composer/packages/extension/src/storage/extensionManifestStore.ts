// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionMap, ExtensionMetadata } from '@botframework-composer/types';

import logger from '../logger';

import { Store } from './store';

const log = logger.extend('extensions');

export type ExtensionManifest = ExtensionMap;

const DEFAULT_MANIFEST: ExtensionManifest = {};

/** In-memory representation of extensions.json */
export class ExtensionManifestStore {
  private store: Store<ExtensionManifest>;

  constructor(private manifestPath: string) {
    this.store = new Store(this.manifestPath, DEFAULT_MANIFEST, log);

    // remove extensions key from existing manifests
    // TODO: remove in the future
    /* istanbul ignore next */
    if (this.manifest && this.manifest.extensions) {
      this.store.replace((this.manifest.extensions as unknown) as ExtensionManifest);
    }
  }

  public getExtensionConfig(id: string) {
    return this.manifest[id];
  }

  public getExtensions() {
    return this.manifest;
  }

  public removeExtension(id: string) {
    this.store.delete(id);
  }

  // update extension config
  public updateExtensionConfig(id: string, newConfig: Partial<ExtensionMetadata>) {
    const currentConfig = this.manifest[id];

    this.store.write(id, Object.assign({} as ExtensionMetadata, currentConfig ?? {}, newConfig));
  }

  private get manifest() {
    return this.store.readAll();
  }
}
