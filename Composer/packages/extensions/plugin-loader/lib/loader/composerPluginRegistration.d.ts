/// <reference types="passport" />
import { RequestHandler } from 'express-serve-static-core';
import { Debugger } from 'debug';
import { PublishPlugin, RuntimeTemplate, BotTemplate } from '../types/types';
import { PluginLoader } from './pluginLoader';
export declare class ComposerPluginRegistration {
  loader: PluginLoader;
  private _name;
  private _description;
  private _log;
  constructor(loader: PluginLoader, name: string, description: string);
  get passport(): import('passport').PassportStatic;
  get name(): string;
  get description(): string;
  set description(val: string);
  get log(): Debugger;
  /**************************************************************************************
   * Storage related features
   *************************************************************************************/
  useStorage(customStorageClass: any): Promise<void>;
  /**************************************************************************************
   * Publish related features
   *************************************************************************************/
  addPublishMethod(plugin: PublishPlugin): Promise<void>;
  /**************************************************************************************
   * Runtime Templates
   *************************************************************************************/
  /**
   * addRuntimeTemplate()
   * @param plugin
   * Expose a runtime template to the Composer UI. Registered templates will become available in the "Runtime settings" tab.
   * When selected, the full content of the `path` will be copied into the project's `runtime` folder. Then, when a user clicks
   * `Start Bot`, the `startCommand` will be executed.  The expected result is that a bot application launches and is made available
   * to communicate with the Bot Framework Emulator.
   * ```ts
   * await composer.addRuntimeTemplate({
   *   key: 'azurewebapp',
   *   name: 'C#',
   *   path: __dirname + '/../../../../runtime/dotnet/azurewebapp',
   *   startCommand: 'dotnet run',
   * });
   * ```
   */
  addRuntimeTemplate(plugin: RuntimeTemplate): void;
  /**************************************************************************************
   * Get current runtime from project
   *************************************************************************************/
  getRuntimeByProject(project: any): RuntimeTemplate;
  /**************************************************************************************
   * Get current runtime by type
   *************************************************************************************/
  getRuntime(type: string | undefined): RuntimeTemplate;
  /**************************************************************************************
   * Add Bot Template (aka, SampleBot)
   *************************************************************************************/
  addBotTemplate(template: BotTemplate): void;
  /**************************************************************************************
   * Add Base Template (aka, BoilerPlate)
   *************************************************************************************/
  addBaseTemplate(template: BotTemplate): void;
  /**************************************************************************************
   * Express/web related features
   *************************************************************************************/
  addWebMiddleware(middleware: RequestHandler): void;
  addWebRoute(type: string, url: string, ...handlers: RequestHandler[]): void;
  /**************************************************************************************
   * Auth/identity functions
   *************************************************************************************/
  usePassportStrategy(passportStrategy: any): void;
  useAuthMiddleware(middleware: RequestHandler): void;
  useUserSerializers(serialize: any, deserialize: any): void;
  addAllowedUrl(url: string): void;
}
//# sourceMappingURL=composerPluginRegistration.d.ts.map
