// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import fs from 'fs';

import passport from 'passport';
import { Express } from 'express';
import { pathToRegexp } from 'path-to-regexp';
import glob from 'globby';
import formatMessage from 'format-message';

import { UserIdentity, ExtensionCollection, RuntimeTemplate, DEFAULT_RUNTIME } from '../types/types';
import log from '../logger';

import { ComposerPluginRegistration } from './composerPluginRegistration';

export class PluginLoader {
  private _passport: passport.PassportStatic;
  private _webserver: Express | undefined;
  public loginUri = '/login';

  public extensions: ExtensionCollection;

  constructor() {
    this.extensions = {
      storage: {},
      publish: {},
      authentication: {
        allowedUrls: [this.loginUri],
      },
      runtimeTemplates: [],
      botTemplates: [],
      baseTemplates: [],
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
          this.extensions.authentication.allowedUrls.filter((pattern) => {
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
      throw new Error(formatMessage('Could not init plugin'));
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
        log('Error:', err?.message);
      }
    } else {
      // noop - this is not a composer plugin
    }
  }

  public async loadPluginsFromFolder(dir: string) {
    const plugins = await glob('*/package.json', { cwd: dir, dot: true });
    for (const p in plugins) {
      await this.loadPluginFromFile(path.join(dir, plugins[p]));
    }
  }

  // get the runtime template currently used from project
  public getRuntimeByProject(project): RuntimeTemplate {
    const type = project.settings.runtime?.key || DEFAULT_RUNTIME;
    const template = this.extensions.runtimeTemplates.find((t) => t.key === type);
    if (template) {
      return template;
    } else {
      throw new Error(formatMessage(`Support for runtime with name ${type} not available`));
    }
  }

  // get the runtime template currently used by type
  public getRuntime(type: string | undefined): RuntimeTemplate {
    if (!type) {
      type = DEFAULT_RUNTIME;
    }
    const template = this.extensions.runtimeTemplates.find((t) => t.key === type);
    if (template) {
      return template;
    } else {
      throw new Error(formatMessage(`Support for runtime type ${type} not available`));
    }
  }

  static async getUserFromRequest(req): Promise<UserIdentity | undefined> {
    return req.user || undefined;
  }
}

export const pluginLoader = new PluginLoader();
export default pluginLoader;
