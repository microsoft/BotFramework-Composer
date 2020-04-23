// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RequestHandler } from 'express-serve-static-core';
import { Debugger } from 'debug';
import { JSONSchema7 } from 'json-schema';

import { PluginLoader } from './pluginLoader';
import log from './logger';
import { PublishPlugin, RuntimeTemplate } from './types';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(message: string, ...args: any[]) {
    this._log(message, ...args);
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
  public async addPublishMethod(plugin: PublishPlugin, schema?: JSONSchema7) {
    log('registering publish method', this.name);
    this.loader.extensions.publish[this.name] = {
      plugin: this,
      methods: plugin,
      schema: schema,
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
   *   key: 'csharp',
   *   name: 'C#',
   *   path: __dirname + '/../../../../BotProject/Templates/CSharp',
   *   startCommand: 'dotnet run',
   * });
   * ```
   */
  public addRuntimeTemplate(plugin: RuntimeTemplate) {
    this.loader.extensions.runtimeTemplates.push(plugin);
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
        method(url, ...handlers);
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
