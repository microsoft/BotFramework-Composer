import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';

import logger from '../logger';

const log = logger.extend('plugins');

export interface ExtensionMap {
  [id: string]: PluginConfig;
}

export interface ExtensionManifest {
  extensions: ExtensionMap;
}

export interface PluginBundle {
  id: string;
  path: string;
}

interface PluginContributes {
  views?: {
    page?: {
      id: string;
      name: string;
      icon?: string;
      when?: string;
    }[];
    publish?: {
      bundleId?: string;
    };
  };
}

export interface PluginConfig {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  /** Special property only used in the in-memory representation of plugins to flag as a built-in. Not written to disk. */
  builtIn?: boolean;
  configuration: object;
  /** Path where module is installed */
  path: string;
  bundles: PluginBundle[];
  contributes: PluginContributes;
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

/** In-memory representation of extension-manifest.json as well as reads / writes data to disk. */
export class ExtensionManifestStore {
  private manifest: ExtensionManifest = DEFAULT_MANIFEST;
  private manifestPath: string;

  constructor() {
    this.manifestPath = process.env.COMPOSER_EXTENSION_DATA as string;
    // create extension-manifest.json if it doesn't exist
    if (!existsSync(this.manifestPath)) {
      log('extension-manifest.json does not exist yet. Writing file to path: %s', this.manifestPath);
      writeJsonSync(this.manifestPath, DEFAULT_MANIFEST);
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
      writeJsonSync(this.manifestPath, this.manifest, { replacer: omitBuiltinProperty });
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
  public updateExtensionConfig(id: string, newConfig: Partial<PluginConfig>) {
    const currentConfig = this.manifest.extensions[id];

    if (currentConfig) {
      this.manifest.extensions[id] = Object.assign(currentConfig, newConfig);
    } else {
      this.manifest.extensions[id] = Object.assign({} as PluginConfig, newConfig);
    }
    // sync changes to disk
    this.writeManifestToDisk();
  }
}
