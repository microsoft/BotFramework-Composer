import { ExtensionBundle, ExtensionMetadata, ExtensionSearchResult } from '../types/extension';
declare class PluginManager {
  private searchCache;
  private _manifest;
  /**
   * Returns all extensions currently in the extension manifest
   */
  getAll(): ExtensionMetadata[];
  /**
   * Returns the extension manifest entry for the specified extension ID
   * @param id Id of the extension to search for
   */
  find(id: string): ExtensionMetadata;
  /**
   * Installs a remote plugin via NPM
   * @param name The name of the plugin to install
   * @param version The version of the plugin to install
   */
  installRemote(name: string, version?: string): Promise<void>;
  /**
   * Loads all the plugins that are checked into the Composer project (1P plugins)
   */
  loadBuiltinPlugins(): Promise<void>;
  /**
   * Loads all installed remote plugins
   * TODO (toanzian / abrown): Needs to be implemented
   */
  loadRemotePlugins(): Promise<void>;
  load(id: string): Promise<void>;
  /**
   * Enables a plugin
   * @param id Id of the plugin to be enabled
   */
  enable(id: string): Promise<void>;
  /**
   * Disables a plugin
   * @param id Id of the plugin to be disabled
   */
  disable(id: string): Promise<void>;
  /**
   * Removes a remote plugin via NPM
   * @param id Id of the plugin to be removed
   */
  remove(id: string): Promise<void>;
  /**
   * Searches for a plugin via NPM's search function
   * @param query The search query
   */
  search(query: string): Promise<ExtensionSearchResult[]>;
  /**
   * Returns a list of all of an extension's bundles
   * @param id The ID of the extension for which we will fetch the list of bundles
   */
  getAllBundles(id: string): Promise<ExtensionBundle[]>;
  /**
   * Returns a specific bundle for an extension
   * @param id The id of the desired extension
   * @param bundleId The id of the desired extension's bundle
   */
  getBundle(id: string, bundleId: string): string | null;
  private getPackageJson;
  private get manifest();
  private get builtinPluginsDir();
  private get remotePluginsDir();
}
declare const manager: PluginManager;
export { manager as PluginManager };
//# sourceMappingURL=manager.d.ts.map
