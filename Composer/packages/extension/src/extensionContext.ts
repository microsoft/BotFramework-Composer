// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import passport from 'passport';
import { Express } from 'express';
import { pathToRegexp } from 'path-to-regexp';
import formatMessage from 'format-message';
import { UserIdentity, ExtensionCollection, RuntimeTemplate } from '@botframework-composer/types';

export const DEFAULT_RUNTIME = 'csharp-azurewebapp';

class ExtensionContext {
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
      next && next();
    });
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

  public async getUserFromRequest(req): Promise<UserIdentity | undefined> {
    return req.user || undefined;
  }
}

const context = new ExtensionContext();
export { context as ExtensionContext };
