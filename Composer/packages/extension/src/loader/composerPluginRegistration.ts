// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RequestHandler } from 'express-serve-static-core';
import { Debugger } from 'debug';

import log from '../logger';
import { PublishPlugin, RuntimeTemplate, BotTemplate } from '../types/types';

import { PluginLoader } from './pluginLoader';

export class ComposerPluginRegistration {
  public loader: PluginLoader;
  private _name: string;
  private _description: string;
  private _log: Debugger;

  constructor(loader: PluginLoader, name: string, description: string) {
    this.loader = loader;
    this._name = name;
    this._description = description;
    this._log = log.extend(name);
  }

  public get passport() {
    return this.loader.passport;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public set description(val: string) {
    this._description = val;
  }

  public get log() {
    return this._log;
  }

  /**************************************************************************************
   * Storage related features
   *************************************************************************************/
  public async useStorage(customStorageClass: any) {
    if (!this.loader.extensions.storage.customStorageClass) {
      this.loader.extensions.storage.customStorageClass = customStorageClass;
    } else {
      throw new Error('Cannot redefine storage driver once set.');
    }
  }

  /**************************************************************************************
   * Publish related features
   *************************************************************************************/
  public async addPublishMethod(plugin: PublishPlugin) {
    log('registering publish method', this.name);
    this.loader.extensions.publish[plugin.customName || this.name] = {
      plugin: {
        name: plugin.customName || this.name,
        description: plugin.customDescription || this.description,
        instructions: plugin.instructions,
        hasView: plugin.hasView,
        schema: plugin.schema,
      },
      methods: plugin,
    };
  }

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
  public addRuntimeTemplate(plugin: RuntimeTemplate) {
    this.loader.extensions.runtimeTemplates.push(plugin);
  }

  /**************************************************************************************
   * Get current runtime from project
   *************************************************************************************/
  public getRuntimeByProject(project): RuntimeTemplate {
    return this.loader.getRuntimeByProject(project);
  }

  /**************************************************************************************
   * Get current runtime by type
   *************************************************************************************/
  public getRuntime(type: string | undefined): RuntimeTemplate {
    return this.loader.getRuntime(type);
  }

  /**************************************************************************************
   * Add Bot Template (aka, SampleBot)
   *************************************************************************************/
  public addBotTemplate(template: BotTemplate) {
    this.loader.extensions.botTemplates.push(template);
  }

  /**************************************************************************************
   * Add Base Template (aka, BoilerPlate)
   *************************************************************************************/
  public addBaseTemplate(template: BotTemplate) {
    this.loader.extensions.baseTemplates.push(template);
  }

  /**************************************************************************************
   * Express/web related features
   *************************************************************************************/
  public addWebMiddleware(middleware: RequestHandler) {
    if (!this.loader.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web middleware.');
    } else {
      this.loader.webserver.use(middleware);
    }
  }

  public addWebRoute(type: string, url: string, ...handlers: RequestHandler[]) {
    if (!this.loader.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web route.');
    } else {
      const method = this.loader.webserver[type.toLowerCase()];

      if (typeof method === 'function') {
        method.call(this.loader.webserver, url, ...handlers);
      } else {
        throw new Error(`Unhandled web route type ${type}`);
      }
    }
  }

  /**************************************************************************************
   * Auth/identity functions
   *************************************************************************************/
  public usePassportStrategy(passportStrategy) {
    // set up the passport strategy to be used
    this.loader.passport.use(passportStrategy);

    // bind a basic auth middleware. this can be overridden. see setAuthMiddleware below
    this.loader.extensions.authentication.middleware = (req, res, next) => {
      if (req.isAuthenticated()) {
        next();
      } else {
        log('Rejecting access to ', req.url);
        res.redirect(this.loader.loginUri);
      }
    };

    // set up default serializer, takes entire object and json encodes
    this.loader.extensions.authentication.serializeUser = (user, done) => {
      done(null, JSON.stringify(user));
    };

    // set up default deserializer.
    this.loader.extensions.authentication.deserializeUser = (user, done) => {
      done(null, JSON.parse(user));
    };

    // use a wrapper on the serializer that calls configured serializer
    this.passport.serializeUser((user, done) => {
      if (this.loader.extensions.authentication.serializeUser) {
        this.loader.extensions.authentication.serializeUser(user, done);
      }
    });

    // use a wrapper on the deserializer that calls configured deserializer
    this.passport.deserializeUser((user, done) => {
      if (this.loader.extensions.authentication.deserializeUser) {
        this.loader.extensions.authentication.deserializeUser(user, done);
      }
    });
  }

  public useAuthMiddleware(middleware: RequestHandler) {
    this.loader.extensions.authentication.middleware = middleware;
  }

  public useUserSerializers(serialize, deserialize) {
    this.loader.extensions.authentication.serializeUser = serialize;
    this.loader.extensions.authentication.deserializeUser = deserialize;
  }

  public addAllowedUrl(url: string) {
    if (this.loader.extensions.authentication.allowedUrls.indexOf(url) < 0) {
      this.loader.extensions.authentication.allowedUrls.push(url);
    }
  }
}
