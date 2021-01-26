// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RequestHandler } from 'express-serve-static-core';
import { Debugger } from 'debug';
import { PassportStatic } from 'passport';

import { IExtensionContext, ExtensionSettings } from './extension';
import { PublishPlugin } from './publish';
import { RuntimeTemplate, BotTemplate } from './runtime';
import { UserIdentity } from './user';
import { IBotProject } from './project';

export type ExtensionStore<T = any> = {
  readAll(): Partial<T>;
  read(key: string): unknown | undefined;
  write(key: string, value: unknown): void;
  delete(key: string): void;
  replace(newData: Partial<T>): void;
  destroy(): void;
};

export interface IExtensionRegistration {
  readonly context: IExtensionContext;
  readonly passport: PassportStatic;
  readonly name: string;
  readonly log: Debugger;
  readonly store: ExtensionStore<any>;
  readonly settings: ExtensionSettings;
  description: string;
  /**
   * Sets a custom storage class.
   * @param customStorageClass
   */
  useStorage(customStorageClass: any): Promise<void>;
  /**
   * Register a publish method.
   * @param plugin
   */
  addPublishMethod(plugin: PublishPlugin): Promise<void>;
  /**
   * Expose a runtime template to the Composer UI. Registered templates will become available in the "Runtime settings" tab.
   * When selected, the full content of the `path` will be copied into the project's `runtime` folder. Then, when a user clicks
   * `Start Bot`, the `startCommand` will be executed.  The expected result is that a bot application launches and is made available
   * to communicate with the Bot Framework Emulator.
   * @param plugin
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
  /**
   * Get current runtime from project.
   * @param project
   */
  getRuntimeByProject(project: any): RuntimeTemplate;
  /**
   * Get current runtime by type.
   * @ param type
   */
  getRuntime(type: string | undefined): RuntimeTemplate;
  /**
   * Get a bot project by its id.
   * @param projectId
   * @param user
   */
  getProjectById(projectId: string, user?: UserIdentity): Promise<IBotProject>;
  /**
   * Add Bot Template (aka, SampleBot)
   * @param template
   */
  addBotTemplate(template: BotTemplate): void;
  /**
   * Add Base Template (aka, BoilerPlate)
   * @param template
   */
  addBaseTemplate(template: BotTemplate): void;

  addWebMiddleware(middleware: RequestHandler): void;
  addWebRoute(type: string, url: string, ...handlers: RequestHandler[]): void;
  usePassportStrategy(passportStrategy: any): void;
  useAuthMiddleware(middleware: RequestHandler): void;
  useUserSerializers(serialize: any, deserialize: any): void;
  addAllowedUrl(url: string): void;
}
