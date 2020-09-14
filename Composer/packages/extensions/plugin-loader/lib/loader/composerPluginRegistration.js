'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const logger_1 = tslib_1.__importDefault(require('../logger'));
class ComposerPluginRegistration {
  constructor(loader, name, description) {
    this.loader = loader;
    this._name = name;
    this._description = description;
    this._log = logger_1.default.extend(name);
  }
  get passport() {
    return this.loader.passport;
  }
  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  set description(val) {
    this._description = val;
  }
  get log() {
    return this._log;
  }
  /**************************************************************************************
   * Storage related features
   *************************************************************************************/
  useStorage(customStorageClass) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      if (!this.loader.extensions.storage.customStorageClass) {
        this.loader.extensions.storage.customStorageClass = customStorageClass;
      } else {
        throw new Error('Cannot redefine storage driver once set.');
      }
    });
  }
  /**************************************************************************************
   * Publish related features
   *************************************************************************************/
  addPublishMethod(plugin) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      logger_1.default('registering publish method', this.name);
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
    });
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
  addRuntimeTemplate(plugin) {
    this.loader.extensions.runtimeTemplates.push(plugin);
  }
  /**************************************************************************************
   * Get current runtime from project
   *************************************************************************************/
  getRuntimeByProject(project) {
    return this.loader.getRuntimeByProject(project);
  }
  /**************************************************************************************
   * Get current runtime by type
   *************************************************************************************/
  getRuntime(type) {
    return this.loader.getRuntime(type);
  }
  /**************************************************************************************
   * Add Bot Template (aka, SampleBot)
   *************************************************************************************/
  addBotTemplate(template) {
    this.loader.extensions.botTemplates.push(template);
  }
  /**************************************************************************************
   * Add Base Template (aka, BoilerPlate)
   *************************************************************************************/
  addBaseTemplate(template) {
    this.loader.extensions.baseTemplates.push(template);
  }
  /**************************************************************************************
   * Express/web related features
   *************************************************************************************/
  addWebMiddleware(middleware) {
    if (!this.loader.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web middleware.');
    } else {
      this.loader.webserver.use(middleware);
    }
  }
  addWebRoute(type, url, ...handlers) {
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
  usePassportStrategy(passportStrategy) {
    // set up the passport strategy to be used
    this.loader.passport.use(passportStrategy);
    // bind a basic auth middleware. this can be overridden. see setAuthMiddleware below
    this.loader.extensions.authentication.middleware = (req, res, next) => {
      if (req.isAuthenticated()) {
        next();
      } else {
        logger_1.default('Rejecting access to ', req.url);
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
  useAuthMiddleware(middleware) {
    this.loader.extensions.authentication.middleware = middleware;
  }
  useUserSerializers(serialize, deserialize) {
    this.loader.extensions.authentication.serializeUser = serialize;
    this.loader.extensions.authentication.deserializeUser = deserialize;
  }
  addAllowedUrl(url) {
    if (this.loader.extensions.authentication.allowedUrls.indexOf(url) < 0) {
      this.loader.extensions.authentication.allowedUrls.push(url);
    }
  }
}
exports.ComposerPluginRegistration = ComposerPluginRegistration;
//# sourceMappingURL=composerPluginRegistration.js.map
