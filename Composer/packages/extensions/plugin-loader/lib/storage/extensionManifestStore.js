'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const fs_extra_1 = require('fs-extra');
const logger_1 = tslib_1.__importDefault(require('../logger'));
const log = logger_1.default.extend('plugins');
const DEFAULT_MANIFEST = {
  extensions: {},
};
function omitBuiltinProperty(key, value) {
  if (key && key === 'builtIn') {
    return undefined;
  }
  return value;
}
/** In-memory representation of extensions.json as well as reads / writes data to disk. */
class ExtensionManifestStore {
  constructor() {
    this.manifest = DEFAULT_MANIFEST;
    this.manifestPath = process.env.COMPOSER_EXTENSION_DATA;
    // create extensions.json if it doesn't exist
    if (!fs_extra_1.existsSync(this.manifestPath)) {
      log('extensions.json does not exist yet. Writing file to path: %s', this.manifestPath);
      fs_extra_1.writeJsonSync(this.manifestPath, DEFAULT_MANIFEST, { spaces: 2 });
    }
    this.readManifestFromDisk(); // load manifest into memory
  }
  // load manifest into memory
  readManifestFromDisk() {
    try {
      const manifest = fs_extra_1.readJsonSync(this.manifestPath);
      this.manifest = manifest;
    } catch (e) {
      log('Error reading %s: %s', this.manifestPath, e);
    }
  }
  // write manifest from memory to disk
  writeManifestToDisk() {
    try {
      fs_extra_1.writeJsonSync(this.manifestPath, this.manifest, { replacer: omitBuiltinProperty, spaces: 2 });
    } catch (e) {
      log('Error writing %s: %s', this.manifestPath, e);
    }
  }
  getExtensionConfig(id) {
    return this.manifest.extensions[id];
  }
  getExtensions() {
    return this.manifest.extensions;
  }
  removeExtension(id) {
    delete this.manifest.extensions[id];
    // sync changes to disk
    this.writeManifestToDisk();
  }
  // update extension config
  updateExtensionConfig(id, newConfig) {
    const currentConfig = this.manifest.extensions[id];
    if (currentConfig) {
      this.manifest.extensions[id] = Object.assign(currentConfig, newConfig);
    } else {
      this.manifest.extensions[id] = Object.assign({}, newConfig);
    }
    // sync changes to disk
    this.writeManifestToDisk();
  }
}
exports.ExtensionManifestStore = ExtensionManifestStore;
//# sourceMappingURL=extensionManifestStore.js.map
