'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const path_1 = tslib_1.__importDefault(require('path'));
const child_process_1 = require('child_process');
const globby_1 = tslib_1.__importDefault(require('globby'));
const fs_extra_1 = require('fs-extra');
const loader_1 = require('../loader');
const logger_1 = tslib_1.__importDefault(require('../logger'));
const extensionManifestStore_1 = require('../storage/extensionManifestStore');
const log = logger_1.default.extend('plugins');
/**
 * Used to safely execute commands that include user input
 */
function runNpm(command) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve) => {
      log('npm %s', command);
      const cmdArgs = command.split(' ');
      let stdout = '';
      let stderr = '';
      const proc = child_process_1.spawn('npm', cmdArgs);
      proc.stdout.on('data', (data) => {
        stdout += data;
      });
      proc.stderr.on('data', (data) => {
        stderr += data;
      });
      proc.on('close', () => {
        resolve({ stdout, stderr });
      });
    });
  });
}
function processBundles(pluginPath, bundles) {
  return bundles.map((b) => Object.assign(Object.assign({}, b), { path: path_1.default.resolve(pluginPath, b.path) }));
}
function getExtensionMetadata(extensionPath, packageJson) {
  var _a, _b, _c, _d, _e, _f;
  return {
    id: packageJson.name,
    name:
      (_b = (_a = packageJson.composer) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0
        ? _b
        : packageJson.name,
    version: packageJson.version,
    enabled: true,
    path: extensionPath,
    bundles: processBundles(
      extensionPath,
      (_d = (_c = packageJson.composer) === null || _c === void 0 ? void 0 : _c.bundles) !== null && _d !== void 0
        ? _d
        : []
    ),
    contributes:
      (_f = (_e = packageJson.composer) === null || _e === void 0 ? void 0 : _e.contributes) !== null && _f !== void 0
        ? _f
        : {},
  };
}
class PluginManager {
  constructor() {
    this.searchCache = new Map();
  }
  /**
   * Returns all extensions currently in the extension manifest
   */
  getAll() {
    const extensions = this.manifest.getExtensions();
    return Object.keys(extensions).map((extId) => extensions[extId]);
  }
  /**
   * Returns the extension manifest entry for the specified extension ID
   * @param id Id of the extension to search for
   */
  find(id) {
    return this.manifest.getExtensions()[id];
  }
  /**
   * Installs a remote plugin via NPM
   * @param name The name of the plugin to install
   * @param version The version of the plugin to install
   */
  installRemote(name, version) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      const packageNameAndVersion = version ? `${name}@${version}` : name;
      const cmd = `install --no-audit --prefix ${this.remotePluginsDir} ${packageNameAndVersion}`;
      log('Installing %s@%s to %s', name, version, this.remotePluginsDir);
      const { stdout } = yield runNpm(cmd);
      log('%s', stdout);
      const packageJson = yield this.getPackageJson(name);
      if (packageJson) {
        const pluginPath = path_1.default.resolve(this.remotePluginsDir, 'node_modules', name);
        this.manifest.updateExtensionConfig(name, getExtensionMetadata(pluginPath, packageJson));
      } else {
        throw new Error(`Unable to install ${packageNameAndVersion}`);
      }
    });
  }
  /**
   * Loads all the plugins that are checked into the Composer project (1P plugins)
   */
  loadBuiltinPlugins() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      log('Loading inherent plugins from: ', this.builtinPluginsDir);
      // get all plugins with a package.json in the plugins dir
      const plugins = yield globby_1.default('*/package.json', { cwd: this.builtinPluginsDir, dot: true });
      for (const p in plugins) {
        // go through each plugin, make sure to add it to the manager store then load it as usual
        const pluginPackageJsonPath = plugins[p];
        const fullPath = path_1.default.join(this.builtinPluginsDir, pluginPackageJsonPath);
        const pluginInstallPath = path_1.default.dirname(fullPath);
        const packageJson = yield fs_extra_1.readJson(fullPath);
        if (packageJson && (!!packageJson.composer || !!packageJson.extendsComposer)) {
          const metadata = getExtensionMetadata(pluginInstallPath, packageJson);
          this.manifest.updateExtensionConfig(
            packageJson.name,
            Object.assign(Object.assign({}, metadata), { builtIn: true })
          );
          yield loader_1.pluginLoader.loadPluginFromFile(fullPath);
        }
      }
    });
  }
  /**
   * Loads all installed remote plugins
   * TODO (toanzian / abrown): Needs to be implemented
   */
  loadRemotePlugins() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      // should perform the same function as loadBuiltInPlugins but from the
      // location that remote / 3P plugins are installed
    });
  }
  load(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        const modulePath = require.resolve(id, {
          paths: [`${this.remotePluginsDir}/node_modules`],
        });
        // eslint-disable-next-line @typescript-eslint/no-var-requires, security/detect-non-literal-require
        const plugin = require(modulePath);
        log('got plugin: ', plugin);
        if (!plugin) {
          throw new Error('Plugin not found');
        }
        yield loader_1.pluginLoader.loadPlugin(id, '', plugin);
      } catch (err) {
        log('Unable to load plugin `%s`', id);
        log('%O', err);
        yield this.remove(id);
        throw err;
      }
    });
  }
  /**
   * Enables a plugin
   * @param id Id of the plugin to be enabled
   */
  enable(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      this.manifest.updateExtensionConfig(id, { enabled: true });
      // re-load plugin
    });
  }
  /**
   * Disables a plugin
   * @param id Id of the plugin to be disabled
   */
  disable(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      this.manifest.updateExtensionConfig(id, { enabled: false });
      // tear down plugin?
    });
  }
  /**
   * Removes a remote plugin via NPM
   * @param id Id of the plugin to be removed
   */
  remove(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      const cmd = `uninstall --no-audit --prefix ${this.remotePluginsDir} ${id}`;
      log('Removing %s', id);
      const { stdout } = yield runNpm(cmd);
      log('%s', stdout);
      this.manifest.removeExtension(id);
    });
  }
  /**
   * Searches for a plugin via NPM's search function
   * @param query The search query
   */
  search(query) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      const cmd = `search --json keywords:botframework-composer ${query}`;
      const { stdout } = yield runNpm(cmd);
      try {
        const result = JSON.parse(stdout);
        if (Array.isArray(result)) {
          result.forEach((searchResult) => {
            var _a;
            const { name, keywords = [], version, description, links } = searchResult;
            if (keywords.includes('botframework-composer')) {
              const url =
                (_a = links === null || links === void 0 ? void 0 : links.npm) !== null && _a !== void 0 ? _a : '';
              this.searchCache.set(name, {
                id: name,
                version,
                description,
                keywords,
                url,
              });
            }
          });
        }
      } catch (err) {
        log('%O', err);
      }
      return Array.from(this.searchCache.values());
    });
  }
  /**
   * Returns a list of all of an extension's bundles
   * @param id The ID of the extension for which we will fetch the list of bundles
   */
  getAllBundles(id) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      const info = this.find(id);
      if (!info) {
        throw new Error('plugin not found');
      }
      return (_a = info.bundles) !== null && _a !== void 0 ? _a : [];
    });
  }
  /**
   * Returns a specific bundle for an extension
   * @param id The id of the desired extension
   * @param bundleId The id of the desired extension's bundle
   */
  getBundle(id, bundleId) {
    const info = this.find(id);
    if (!info) {
      throw new Error('plugin not found');
    }
    const bundle = info.bundles.find((b) => b.id === bundleId);
    if (!bundle) {
      throw new Error('bundle not found');
    }
    return bundle.path;
  }
  getPackageJson(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        const pluginPackagePath = path_1.default.resolve(this.remotePluginsDir, 'node_modules', id, 'package.json');
        log('fetching package.json for %s at %s', id, pluginPackagePath);
        const packageJson = yield fs_extra_1.readJson(pluginPackagePath);
        return packageJson;
      } catch (err) {
        log('Error getting package json for %s', id);
        console.error(err);
      }
    });
  }
  get manifest() {
    if (this._manifest) {
      return this._manifest;
    }
    this._manifest = new extensionManifestStore_1.ExtensionManifestStore();
    return this._manifest;
  }
  get builtinPluginsDir() {
    if (!process.env.COMPOSER_BUILTIN_PLUGINS_DIR) {
      throw new Error('COMPOSER_BUILTIN_PLUGINS_DIR must be set.');
    }
    return process.env.COMPOSER_BUILTIN_PLUGINS_DIR;
  }
  get remotePluginsDir() {
    if (!process.env.COMPOSER_REMOTE_PLUGINS_DIR) {
      throw new Error('COMPOSER_REMOTE_PLUGINS_DIR must be set.');
    }
    return process.env.COMPOSER_REMOTE_PLUGINS_DIR;
  }
}
const manager = new PluginManager();
exports.PluginManager = manager;
//# sourceMappingURL=manager.js.map
