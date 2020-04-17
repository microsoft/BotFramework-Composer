// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';
import * as pathLib from 'path';

// import * as passport from 'passport';
import { Express } from 'express';
import glob from 'globby';
import { pathToRegexp } from 'path-to-regexp';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const passport = require('passport');

export class ComposerPluginRegistration {
  public loader: PluginLoader;
  private _name: string;
  private _description: string;

  constructor(loader: PluginLoader, name: string, description: string) {
    this.loader = loader;
    this._name = name;
    this._description = description;
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
    console.log('registering publish method', this.name);
    this.loader.extensions.publish[this.name] = {
      plugin: this,
      methods: plugin,
    };
  }

  /**************************************************************************************
   * Runtime Templates
   *************************************************************************************/
  public async addRuntimeTemplate(plugin: RuntimeTemplate) {
    this.loader.extensions.runtimeTemplates.push(plugin);
  }

  /**************************************************************************************
   * Express/web related features
   *************************************************************************************/
  public addWebMiddleware(middleware: (req, res, next) => void) {
    if (!this.loader.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web middleware.');
    } else {
      this.loader.webserver.use(middleware);
    }
  }

  public addWebRoute(
    type: string,
    url: string,
    callbackOrMiddleware: (req: any, res: any, next?: any) => void,
    callback?: (req: any, res: any) => void
  ) {
    if (!this.loader.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web route.');
    } else {
      if (callback) {
        switch (type.toLowerCase()) {
          case 'get':
            this.loader.webserver.get(url, callbackOrMiddleware, callback);
            break;
          case 'put':
            this.loader.webserver.put(url, callbackOrMiddleware, callback);
            break;
          case 'post':
            this.loader.webserver.post(url, callbackOrMiddleware, callback);
            break;
          case 'delete':
            this.loader.webserver.delete(url, callbackOrMiddleware, callback);
            break;
          default:
            throw new Error(`Unhandled web route type ${type}`);
        }
      } else {
        switch (type.toLowerCase()) {
          case 'get':
            this.loader.webserver.get(url, callbackOrMiddleware);
            break;
          case 'put':
            this.loader.webserver.put(url, callbackOrMiddleware);
            break;
          case 'post':
            this.loader.webserver.post(url, callbackOrMiddleware);
            break;
          case 'delete':
            this.loader.webserver.delete(url, callbackOrMiddleware);
            break;
          default:
            throw new Error(`Unhandled web route type ${type}`);
        }
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
        console.warn('Rejecting access to ', req.url);
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

  public useAuthMiddleware(middleware: (req, res, next) => void) {
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

interface PublishResult {
  message: string;
  comment?: string;
  log?: string;
  id?: string;
  time?: Date;
  endpointURL?: string;
  status?: number;
}

interface PublishResponse {
  status: number;
  result: PublishResult;
}

interface PublishPlugin {
  publish: (config: any, project: any, metadata: any, user: any) => Promise<PublishResponse>;
  getStatus?: (config: any, project: any, user: any) => Promise<PublishResponse>;
  getHistory?: (config: any, project: any, user: any) => Promise<PublishResult[]>;
  rollback?: (config: any, project: any, rollbackToVersion: string, user: any) => Promise<PublishResponse>;
  [key: string]: any;
}

export interface RuntimeTemplate {
  key: string; // internal use key
  name: string; // name of runtime template to display in interface
  path: string; // path to runtime template on disk
  startCommand: string; // command used to start runtime
}

export class PluginLoader {
  private _passport;
  private _webserver: Express | undefined;
  public loginUri: string;

  public extensions: {
    storage: {
      [key: string]: any;
    };
    publish: {
      [key: string]: {
        plugin: ComposerPluginRegistration;
        methods: PublishPlugin;
      };
    };
    authentication: {
      middleware?: (req, res, next) => void;
      serializeUser?: (user: any, next: any) => void;
      deserializeUser?: (user: any, next: any) => void;
      allowedUrls: string[];
      [key: string]: any;
    };
    runtimeTemplates: RuntimeTemplate[];
  };

  constructor() {
    // load any plugins present in the default folder
    // noop for now
    this.loginUri = '/login';

    this.extensions = {
      storage: {},
      publish: {},
      authentication: {
        allowedUrls: [this.loginUri],
      },
      runtimeTemplates: [],
    };
    this._passport = passport;
  }

  public get passport() {
    return this._passport;
  }

  public get webserver() {
    return this._webserver;
  }

  // allow webserver to be set programmatically
  public useExpress(webserver: Express) {
    this._webserver = webserver;

    this._webserver.use((req, res, next) => {
      // if an auth middleware exists...
      if (this.extensions.authentication.middleware) {
        // and the url is not in the allowed urls array
        if (
          this.extensions.authentication.allowedUrls.filter(pattern => {
            const regexp = pathToRegexp(pattern);
            return req.url.match(regexp);
          }).length === 0
        ) {
          // hand off to the plugin-specified middleware
          return this.extensions.authentication.middleware(req, res, next);
        }
      }
      next();
    });
  }

  public async loadPlugin(name: string, description: string, thisPlugin: any) {
    const pluginRegistration = new ComposerPluginRegistration(this, name, description);
    if (typeof thisPlugin.default === 'function') {
      // the module exported just an init function
      thisPlugin.default.call(null, pluginRegistration);
    } else if (thisPlugin.default && thisPlugin.default.initialize) {
      // the module exported an object with an initialize method
      thisPlugin.default.initialize.call(null, pluginRegistration);
    } else if (thisPlugin.initialize && typeof thisPlugin.initialize === 'function') {
      // the module exported an object with an initialize method
      thisPlugin.initialize.call(null, pluginRegistration);
    } else {
      throw new Error('Could not init plugin');
    }
  }

  public async loadPluginFromFile(path: string) {
    const packageJSON = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(packageJSON);

    if (json.extendsComposer) {
      const modulePath = path.replace(/package\.json$/, '');
      try {
        // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
        const thisPlugin = require(modulePath);
        this.loadPlugin(json.name, json.description, thisPlugin);
      } catch (err) {
        console.error(err);
      }
    } else {
      // noop - this is not a composer plugin
    }
  }

  public async loadPluginsFromFolder(path: string) {
    const plugins = await glob('*/package.json', { cwd: path, dot: true });
    for (const p in plugins) {
      await this.loadPluginFromFile(pathLib.join(path, plugins[p]));
    }
  }

  static async getUserFromRequest(req): Promise<UserIdentity | undefined> {
    return req.user || undefined;
  }
}

// todo: is there some existing Passport user typedef?
export interface UserIdentity {
  [key: string]: any;
}

export const pluginLoader = new PluginLoader();
export default pluginLoader;
