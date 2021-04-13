// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import { AzureTenant, ElectronAuthParameters } from '@botframework-composer/types';
import { app } from 'electron';
import fetch from 'node-fetch';

import ElectronWindow from '../electronWindow';
import { isLinux, isMac } from '../utility/platform';
import logger from '../utility/logger';
import { getUnpackedAsarPath } from '../utility/getUnpackedAsarPath';
import { isDevelopment } from '../utility/env';

import { OneAuth } from './oneauth';
import { OneAuthShim } from './oneAuthShim';
import { OneAuthBase } from './oneAuthBase';

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
const ARM_AUTHORITY = 'https://login.microsoftonline.com/organizations';
const ARM_RESOURCE = 'https://management.core.windows.net';

type GetTenantsResult = {
  value: AzureTenant[];
};

// Pulled from ./oneAuth.d.ts
enum Status {
  Unexpected = 0,
  Reserved = 1,
  InteractionRequired = 2,
  NoNetwork = 3,
  NetworkTemporarilyUnavailable = 4,
  ServerTemporarilyUnavailable = 5,
  ApiContractViolation = 6,
  UserCanceled = 7,
  ApplicationCanceled = 8,
  IncorrectConfiguration = 9,
  InsufficientBuffer = 10,
  AuthorityUntrusted = 11,
}

// Pulled from ./oneAuth.d.ts
enum Flight {
  UseMsalforMsa = 2,
  UseWamforMSA = 1002,
  UseWamforAAD = 1003,
}

export class OneAuthInstance extends OneAuthBase {
  private initialized: boolean;
  private _oneAuth: typeof OneAuth | null = null; //eslint-disable-line
  private signedInAccount: OneAuth.Account | undefined;
  private signedInARMAccount: OneAuth.Account | undefined;
  /** Token solely used to fetch tenants */
  private tenantToken: string | undefined;

  constructor() {
    super();
    log('Using genuine OneAuth.');
    // will wait until called to initialize (so that we're sure we have a browser window)
    this.initialized = false;
  }

  private initialize() {
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
      const msaConfig = new this.oneAuth.MsaConfiguration(
        COMPOSER_CLIENT_ID,
        COMPOSER_REDIRECT_URI,
        GRAPH_RESOURCE + '/Application.ReadWrite.All',
        undefined
      );
      const aadConfig = new this.oneAuth.AadConfiguration(
        COMPOSER_CLIENT_ID,
        COMPOSER_REDIRECT_URI,
        GRAPH_RESOURCE,
        false // prefer broker
      );
      this.oneAuth.setFlights([Flight.UseMsalforMsa]);
      this.oneAuth.initialize(appConfig, msaConfig, aadConfig, undefined);
      this.initialized = true;
      log('Service initialized.');
    } else {
      log('Electron window did exist not at time of initialization.');
    }
  }

  public async getAccessToken(
    params: ElectronAuthParameters
  ): Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }> {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      log('Getting access token...');
      if (!params.targetResource) {
        throw 'Target resource required to get access token.';
      }

      // Temporary until we properly configure local Mac dev experience
      if (isMac() && isDevelopment) {
        log('Mac development env detected. Getting access token using interactive sign in instead of silently.');
        return this.TEMPORARY_getAccessTokenOnMacDev(params);
      }
      // if Account not exist, use arm account. in case the window popup again
      if (!this.signedInAccount) {
        this.signedInAccount = this.signedInARMAccount;
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
      const reqParams = new this.oneAuth.AuthParameters(
        DEFAULT_AUTH_SCHEME,
        DEFAULT_AUTH_AUTHORITY,
        params.targetResource,
        this.signedInAccount.realm,
        ''
      );
      const result = await this.oneAuth.acquireCredentialSilently(this.signedInAccount?.id, reqParams, '');
      if (result.credential && result.credential.value) {
        log('Acquired access token. %s', result.credential.value);
        return {
          accessToken: result.credential.value,
          acquiredAt: Date.now(),
          expiryTime: result.credential.expiresOn,
        };
      }
      throw 'Could not acquire an access token.';
    } catch (e) {
      if (e.error?.status === Status.InteractionRequired && this.signedInAccount) {
        // try again but interactively
        log('Interaction required. Trying again interactively to get access token.');
        // use the signed in account to acquire a token
        const reqParams = new this.oneAuth.AuthParameters(
          DEFAULT_AUTH_SCHEME,
          DEFAULT_AUTH_AUTHORITY,
          params.targetResource,
          this.signedInAccount.realm,
          ''
        );
        const result = await this.oneAuth.acquireCredentialInteractively(this.signedInAccount?.id, reqParams, '');
        if (result.credential && result.credential.value) {
          log('Acquired access token interactively. %s', result.credential.value);
          return {
            accessToken: result.credential.value,
            acquiredAt: Date.now(),
            expiryTime: result.credential.expiresOn,
          };
        }
      }
      log('Error while trying to get an access token: %O', e);
      throw e;
    }
  }

  public async getTenants(): Promise<AzureTenant[]> {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      if (!this.signedInARMAccount || !this.tenantToken) {
        // log the user into the infrastructure tenant to get a token that can be used on the "tenants" API
        log('Logging user into ARM...');
        const signInParams = new this.oneAuth.AuthParameters(DEFAULT_AUTH_SCHEME, ARM_AUTHORITY, ARM_RESOURCE, '', '');
        const result: OneAuth.AuthResult = await this.oneAuth.signInInteractively('', signInParams, '');
        this.signedInARMAccount = result.account;
        this.tenantToken = result.credential.value;
      }

      // call the tenants API
      const tenantsResult = await fetch('https://management.azure.com/tenants?api-version=2020-01-01', {
        headers: { Authorization: `Bearer ${this.tenantToken}` },
      });
      const tenants = (await tenantsResult.json()) as GetTenantsResult;
      log('Got Azure tenants for user: %O', tenants.value);
      return tenants.value;
    } catch (e) {
      log('There was an error trying to log the user into ARM: %O', e);
      throw e;
    }
  }

  public async getARMTokenForTenant(tenantId: string): Promise<string> {
    if (!this.initialized) {
      this.initialize();
    }
    // sign in arm account.
    if (!this.signedInARMAccount) {
      const signInParams = new this.oneAuth.AuthParameters(DEFAULT_AUTH_SCHEME, ARM_AUTHORITY, ARM_RESOURCE, '', '');
      const result: OneAuth.AuthResult = await this.oneAuth.signInInteractively('', signInParams, '');
      this.signedInARMAccount = result.account;
    }
    if (this.signedInARMAccount) {
      try {
        log('Getting an ARM token for tenant %s', tenantId);
        const tokenParams = new this.oneAuth.AuthParameters(
          DEFAULT_AUTH_SCHEME,
          `https://login.microsoftonline.com/${tenantId}`,
          ARM_RESOURCE,
          '',
          ''
        );
        const result = await this.oneAuth.acquireCredentialSilently(this.signedInARMAccount.id, tokenParams, '');
        log('Acquired ARM token for tenant: %s', result.credential.value);
        return result.credential.value;
      } catch (e) {
        if (e.error?.status === Status.InteractionRequired) {
          // try again but interactively
          log('Acquiring ARM token failed: Interaction required. Trying again interactively to get access token.');
          const tokenParams = new this.oneAuth.AuthParameters(
            DEFAULT_AUTH_SCHEME,
            `https://login.microsoftonline.com/${tenantId}`,
            ARM_RESOURCE,
            '',
            ''
          );
          const result = await this.oneAuth.acquireCredentialInteractively(this.signedInARMAccount.id, tokenParams, '');
          if (result.credential && result.credential.value) {
            log('Acquired access token interactively. %s', result.credential.value);
            return result.credential.value;
          }
        }
        log('There was an error trying to get an ARM token for tenant %s: %O', tenantId, e);
        throw e;
      }
    }
    return '';
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

  /** Temporary workaround on Mac until we figure out how to enable keychain access on a dev build. */
  // eslint-disable-next-line
  private async TEMPORARY_getAccessTokenOnMacDev(
    params: ElectronAuthParameters
  ): Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }> {
    try {
      // sign-in every time with auth parameters to get a token
      const reqParams = new this.oneAuth.AuthParameters(
        DEFAULT_AUTH_SCHEME,
        DEFAULT_AUTH_AUTHORITY,
        params.targetResource,
        '',
        ''
      );
      const result = await this.oneAuth.signInInteractively('', reqParams, '');
      if (result?.credential?.value) {
        log('Acquired access token. %s', result.credential.value);
        return {
          accessToken: result.credential.value,
          acquiredAt: Date.now(),
          expiryTime: result.credential.expiresOn,
        };
      }
      throw 'Could not acquire an access token.';
    } catch (e) {
      log('There was an error trying to acquire a token on Mac by signing in interactively: %O', e);
      throw e;
    }
  }

  private get oneAuth() {
    if (!this._oneAuth) {
      log('Attempting to load oneauth module from %s.', this.oneauthPath);
      try {
        // eslint-disable-next-line security/detect-non-literal-require
        this._oneAuth = require(this.oneauthPath) as typeof OneAuth;
      } catch (e) {
        log('Error loading oneauth module. %O', e);
        throw e;
      }
    }

    return this._oneAuth;
  }

  private get oneauthPath() {
    if (process.env.NODE_ENV === 'production') {
      return path.join(getUnpackedAsarPath(), 'oneauth');
    } else {
      return path.resolve(__dirname, '../../oneauth-temp');
    }
  }
}

// only use the shim in Linux, or dev environment without flag enabled
const useShim = (isDevelopment && process.env.COMPOSER_ENABLE_ONEAUTH !== 'true') || isLinux();

export const OneAuthService = useShim ? new OneAuthShim() : new OneAuthInstance();
