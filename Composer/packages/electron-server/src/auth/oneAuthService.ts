// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import { app } from 'electron';

import ElectronWindow from '../electronWindow';
import { isLinux, isMac, isWindows } from '../utility/platform';
import logger from '../utility/logger';
import { getUnpackedAsarPath } from '../utility/getUnpackedAsarPath';

import { OneAuth } from './oneauth';
import { oneauthShim } from './oneauthShim';

const log = logger.extend('one-auth');

const COMPOSER_APP_ID = 'com.microsoft.BotFrameworkComposer';
const COMPOSER_APP_NAME = 'BotFrameworkComposer';
const COMPOSER_APP_VERSION = app.getVersion();
const COMPOSER_CLIENT_ID = 'ce48853e-0605-4f77-8746-d70ac63cc6bc';
const COMPOSER_REDIRECT_URI = 'ms-appx-web://Microsoft.AAD.BrokerPlugin/ce48853e-0605-4f77-8746-d70ac63cc6bc';
const GRAPH_RESOURCE = 'https://graph.microsoft.com';
const DEFAULT_LOCALE = 'en'; // TODO: get this from settings?
const DEFAULT_AUTH_SCHEME = 2; // bearer token
const DEFAULT_AUTH_AUTHORITY = 'https://login.microsoftonline.com/common'; // work and school accounts

// TODO: share this type with ElectronContext
type AuthParamOptions = {
  target: string;
};

class OneAuthInstance {
  private initialized: boolean;
  private _oneAuth: typeof OneAuth | null = null; //eslint-disable-line
  private signedInAccount: OneAuth.Account | undefined;

  constructor() {
    // will wait until called to initialize (so that we're sure we have a browser window)
    this.initialized = false;
  }

  private initialize() {
    if (isLinux()) {
      console.error('OneAuth is currently unsupported in Linux.');
      return;
    }
    const window = ElectronWindow.getInstance().browserWindow;
    if (window) {
      const isDevelopment = Boolean(process.env.NODE_ENV && process.env.NODE_ENV === 'development');
      log('PII logging enabled: %s', isDevelopment);
      this.oneAuth.setLogPiiEnabled(isDevelopment);
      this.oneAuth.setLogCallback((logLevel, message) => {
        log('%s %s', logLevel, message);
      });
      log('Initializing...');
      const appConfig = new this.oneAuth.AppConfiguration(
        COMPOSER_APP_ID,
        COMPOSER_APP_NAME,
        COMPOSER_APP_VERSION,
        DEFAULT_LOCALE,
        'Please login',
        window.getNativeWindowHandle()
      );
      // Personal Accounts
      // const msaConfig = new OneAuth.MsaConfiguration();
      const aadConfig = new this.oneAuth.AadConfiguration(
        COMPOSER_CLIENT_ID,
        COMPOSER_REDIRECT_URI,
        GRAPH_RESOURCE,
        false // prefer broker
      );
      this.oneAuth.initialize(appConfig, undefined, aadConfig, undefined);
      this.initialized = true;
      log('Service initialized.');
    } else {
      log('Electron window did exist not at time of initialization.');
    }
  }

  public async getAccessToken(
    options?: AuthParamOptions
  ): Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }> {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      log('Getting access token...');
      if (!options?.target) {
        throw 'Target resource required to get access token.';
      }
      if (!this.signedInAccount) {
        // we need to sign in
        log('No signed in account found. Signing user in before getting access token.');
        await this.signIn();
      }
      if (!this.signedInAccount?.id) {
        throw 'Signed in account does not have an id.';
      }
      // use the signed in account to acquire a token
      const params = new this.oneAuth.AuthParameters(
        DEFAULT_AUTH_SCHEME,
        DEFAULT_AUTH_AUTHORITY,
        options.target,
        this.signedInAccount.realm,
        ''
      );
      const result = await this.oneAuth.acquireCredentialSilently(this.signedInAccount?.id, params, '');
      if (result.credential && result.credential.value) {
        log('Acquired access token. %s', result.credential.value);
        return {
          accessToken: result.credential.value,
          acquiredAt: Date.now(),
          expiryTime: result.credential.expiresOn,
        };
      }
      if (result.error) {
        // TODO: better error handling
        throw result.error;
      }
      throw 'Could not acquire an access token.';
    } catch (e) {
      log('Error while trying to get an access token: %O', e);
      throw e;
    }
  }

  public shutdown() {
    log('Shutting down...');
    this.oneAuth.shutdown();
    log('Shut down.');
  }

  /**
   * Clears the account saved in memory.
   */
  public signOut() {
    log('Signing out user...');
    this.signedInAccount = undefined;
    log('Signed out user.');
  }

  /**
   * Sign the user in and save the account in memory.
   */
  private async signIn(): Promise<void> {
    try {
      log('Signing in...');
      const result: OneAuth.AuthResult = await this.oneAuth.signInInteractively('', undefined, '');
      this.signedInAccount = result.account;
      log('Signed in successfully. Got account: %O', result.account);
    } catch (e) {
      log('There was an error trying to sign in: %O', e);
      throw e;
    }
  }

  private get oneAuth() {
    if (!this._oneAuth) {
      if (this.loadOneAuth()) {
        log('Attempting to load oneauth module from %s.', this.oneauthPath);
        try {
          // eslint-disable-next-line security/detect-non-literal-require
          this._oneAuth = require(this.oneauthPath) as typeof OneAuth;
        } catch (e) {
          log('Error loading oneauth module. %O', e);
        }
      }

      // if we still haven't loaded oneauth, fallback to the shim
      if (!this._oneAuth) {
        log('Using oneauth shim.');
        this._oneAuth = oneauthShim;
      }
    }

    return this._oneAuth;
  }

  private loadOneAuth() {
    return Boolean(
      (process.env.NODE_ENV === 'production' || process.env.COMPOSER_ENABLE_ONEAUTH) && (isMac() || isWindows())
    );
  }

  private get oneauthPath() {
    if (process.env.NODE_ENV === 'production') {
      return path.join(getUnpackedAsarPath(), 'oneauth');
    } else {
      return path.resolve(__dirname, '../../oneauth-temp');
    }
  }
}

export const OneAuthService = new OneAuthInstance();
