import passport from 'passport';
import { Express } from 'express';
import { UserIdentity, ExtensionCollection, RuntimeTemplate } from '../types/types';
export declare class PluginLoader {
  private _passport;
  private _webserver;
  loginUri: string;
  extensions: ExtensionCollection;
  constructor();
  get passport(): passport.PassportStatic;
  get webserver(): Express | undefined;
  useExpress(webserver: Express): void;
  loadPlugin(name: string, description: string, thisPlugin: any): Promise<void>;
  loadPluginFromFile(path: string): Promise<void>;
  loadPluginsFromFolder(dir: string): Promise<void>;
  getRuntimeByProject(project: any): RuntimeTemplate;
  getRuntime(type: string | undefined): RuntimeTemplate;
  static getUserFromRequest(req: any): Promise<UserIdentity | undefined>;
}
export declare const pluginLoader: PluginLoader;
export default pluginLoader;
//# sourceMappingURL=pluginLoader.d.ts.map
