// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import passport from 'passport';
import { Express } from 'express';
import { pathToRegexp } from 'path-to-regexp';
import formatMessage from 'format-message';
import {
  UserIdentity,
  ExtensionCollection,
  RuntimeTemplate,
  IBotProject,
  IExtensionContext,
  ComposerEvent,
} from '@botframework-composer/types';

import { BotProjectService } from '../../services/project';

export const DEFAULT_RUNTIME = 'csharp-azurewebapp';

type Listener = (...args: any[]) => Promise<void> | void;
class AsyncEventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  public addListener(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)?.push(listener);
  }

  public removeListener(event: string, listener: Listener) {
    const eventListeners = this.listeners.get(event);

    if (eventListeners && eventListeners.length > 0) {
      const newListeners = eventListeners.filter((l) => l !== listener);
      this.listeners.set(event, newListeners);
    }
  }

  public on(event: string, listener: Listener) {
    this.addListener(event, listener);
  }

  public async emit(event: string, ...args: any[]) {
    const listeners = this.listeners.get(event) ?? [];

    for (const l of listeners) {
      try {
        await l(...args);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

class ExtensionContext implements IExtensionContext {
  private _passport: passport.PassportStatic;
  private _webserver: Express | undefined;
  private _emitter = new AsyncEventEmitter();
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

  public get botProjectService() {
    return BotProjectService;
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
      next?.();
    });
  }

  // get the runtime template currently used from project
  public getRuntimeByProject(project: IBotProject): RuntimeTemplate {
    const type = project.settings?.runtime?.key || DEFAULT_RUNTIME;
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

  public async getProjectById(projectId: string, user?: UserIdentity): Promise<IBotProject> {
    if (this.botProjectService !== undefined) {
      return this.botProjectService.getProjectById(projectId, user);
    } else {
      throw new Error('No BotProjectService available');
    }
  }

  public on(event: ComposerEvent, listener: (...args: any[]) => void | Promise<void>) {
    this._emitter.addListener(event, listener);
  }

  public async emit(event: ComposerEvent, ...args: any[]) {
    await this._emitter.emit(event, ...args);
  }
}

const context = new ExtensionContext();
export { context as ExtensionContext };
