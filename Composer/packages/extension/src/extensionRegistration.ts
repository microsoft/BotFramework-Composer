// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { RequestHandler, Router } from 'express-serve-static-core';
import { Debugger } from 'debug';
import {
  PublishPlugin,
  RuntimeTemplate,
  BotTemplate,
  IExtensionContext,
  UserIdentity,
  IBotProject,
  IExtensionRegistration,
} from '@botframework-composer/types';
import { PassportStatic } from 'passport';

import log from './logger';
import { Store } from './storage/store';

export class ExtensionRegistration implements IExtensionRegistration {
  private _name: string;
  private _description: string;
  private _log: Debugger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _store: Store<any> | null = null;

  constructor(public context: IExtensionContext, name: string, description: string, private dataDir: string) {
    this._name = name;
    this._description = description;
    this._log = log.extend(name);
  }

  public get passport(): PassportStatic {
    return this.context.passport;
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

  public get store() {
    if (this._store === null) {
      const storePath = path.join(this.dataDir, `${this.name}.json`);
      this._store = new Store(storePath, {}, this.log);
    }

    return this._store;
  }

  /**************************************************************************************
   * Storage related features
   *************************************************************************************/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async useStorage(customStorageClass: any) {
    if (!this.context.extensions.storage.customStorageClass) {
      this.context.extensions.storage.customStorageClass = customStorageClass;
    } else {
      throw new Error('Cannot redefine storage driver once set.');
    }
  }

  /**************************************************************************************
   * Publish related features
   *************************************************************************************/
  public async addPublishMethod(plugin: PublishPlugin) {
    if (this.context.extensions.publish[plugin.name]) {
      throw new Error(`Duplicate publish method. Cannot register publish method with name ${plugin.name}.`);
    }

    log('registering publish method', plugin.name);
    this.context.extensions.publish[plugin.name] = {
      plugin: {
        name: plugin.name,
        description: plugin.description || this.description,
        instructions: plugin.instructions,
        extensionId: this.name,
        bundleId: plugin.bundleId,
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
    this.context.extensions.runtimeTemplates.push(plugin);
  }

  /**************************************************************************************
   * Get current runtime from project
   *************************************************************************************/
  public getRuntimeByProject(project): RuntimeTemplate {
    return this.context.getRuntimeByProject(project);
  }

  /**************************************************************************************
   * Get current runtime by type
   *************************************************************************************/
  public getRuntime(type: string | undefined): RuntimeTemplate {
    return this.context.getRuntime(type);
  }

  public async getProjectById(projectId: string, user?: UserIdentity): Promise<IBotProject> {
    return this.context.getProjectById(projectId, user);
  }

  /**************************************************************************************
   * Add Bot Template (aka, SampleBot)
   *************************************************************************************/
  public addBotTemplate(template: BotTemplate) {
    this.context.extensions.botTemplates.push(template);
  }

  /**************************************************************************************
   * Add Base Template (aka, BoilerPlate)
   *************************************************************************************/
  public addBaseTemplate(template: BotTemplate) {
    this.context.extensions.baseTemplates.push(template);
  }

  /**************************************************************************************
   * Express/web related features
   *************************************************************************************/
  public addWebMiddleware(middleware: RequestHandler) {
    if (!this.context.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web middleware.');
    } else {
      this.context.webserver.use(middleware);
    }
  }

  public addWebRoute(type: string, url: string, ...handlers: RequestHandler[]) {
    if (!this.context.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web route.');
    } else {
      const method = this.context.webserver[type.toLowerCase()];

      if (typeof method === 'function') {
        method.call(this.context.webserver, url, ...handlers);
      } else {
        throw new Error(`Unhandled web route type ${type}`);
      }
    }
  }

  public addRouter(routerPath: string, router: Router) {
    if (!this.context.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add express Router.');
    } else {
      this.context.webserver.use(routerPath || '/', router);
    }
  }

  /**************************************************************************************
   * Auth/identity functions
   *************************************************************************************/
  public usePassportStrategy(passportStrategy) {
    // set up the passport strategy to be used
    this.context.passport.use(passportStrategy);

    // bind a basic auth middleware. this can be overridden. see setAuthMiddleware below
    this.context.extensions.authentication.middleware = (req, res, next) => {
      if (req.isAuthenticated()) {
        next?.();
      } else {
        log('Rejecting access to ', req.url);
        res.redirect(this.context.loginUri);
      }
    };

    // set up default serializer, takes entire object and json encodes
    this.context.extensions.authentication.serializeUser = (user, done) => {
      done(null, JSON.stringify(user));
    };

    // set up default deserializer.
    this.context.extensions.authentication.deserializeUser = (user, done) => {
      done(null, JSON.parse(user));
    };

    // use a wrapper on the serializer that calls configured serializer
    this.passport.serializeUser((user, done) => {
      if (this.context.extensions.authentication.serializeUser) {
        this.context.extensions.authentication.serializeUser(user, done);
      }
    });

    // use a wrapper on the deserializer that calls configured deserializer
    this.passport.deserializeUser((user, done) => {
      if (this.context.extensions.authentication.deserializeUser) {
        this.context.extensions.authentication.deserializeUser(user, done);
      }
    });
  }

  public useAuthMiddleware(middleware: RequestHandler) {
    this.context.extensions.authentication.middleware = middleware;
  }

  public useUserSerializers(serialize, deserialize) {
    this.context.extensions.authentication.serializeUser = serialize;
    this.context.extensions.authentication.deserializeUser = deserialize;
  }

  public addAllowedUrl(url: string) {
    if (this.context.extensions.authentication.allowedUrls.indexOf(url) < 0) {
      this.context.extensions.authentication.allowedUrls.push(url);
    }
  }
}
