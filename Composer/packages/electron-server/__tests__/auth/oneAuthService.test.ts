// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OneAuthInstance } from '../../src/auth/oneAuthService';

jest.mock('../../src/electronWindow', () => ({
  getInstance: jest.fn().mockReturnValue({
    browserWindow: {
      getNativeWindowHandle: jest.fn(),
    },
  }),
}));

jest.mock('../../src/utility/platform', () => ({
  isLinux: () => process.env.TEST_IS_LINUX === 'true',
  isMac: () => false,
}));

const mockFetch = jest.fn().mockResolvedValue(true);
jest.mock('node-fetch', () => async (...args) => mockFetch(...args));

describe('OneAuth Serivce', () => {
  const INTERACTION_REQUIRED = 'interactionRequired';
  const mockAccount = {
    id: 'myAccount',
    realm: 'myTenant',
  };
  const mockCredential = {
    expiresOn: 9999,
    value: 'someToken',
  };
  const mockOneAuth = {
    acquireCredentialInteractively: jest.fn().mockResolvedValue({ credential: mockCredential }),
    acquireCredentialSilently: jest.fn().mockResolvedValue({ credential: mockCredential }),
    initialize: jest.fn(),
    setLogCallback: jest.fn(),
    setLogPiiEnabled: jest.fn(),
    signInInteractively: jest.fn().mockResolvedValue({ account: mockAccount, credential: mockCredential }),
    shutdown: jest.fn(),
    AadConfiguration: class AAD {},
    AppConfiguration: class App {},
    AuthParameters: class AP {},
    Status: {
      InteractionRequired: INTERACTION_REQUIRED,
    },
    MsaConfiguration: class MSA {},
    setFlights: jest.fn(),
  };
  let oneAuthService = new OneAuthInstance(); // bypass the shim logic
  const processEnvBackup = { ...process.env };

  afterEach(() => {
    process.env = processEnvBackup;
  });

  beforeEach(() => {
    jest.resetModules();
    oneAuthService = new OneAuthInstance();
    // eslint-disable-next-line no-underscore-dangle
    (oneAuthService as any)._oneAuth = mockOneAuth;
    mockOneAuth.acquireCredentialInteractively.mockClear();
    mockOneAuth.acquireCredentialSilently.mockClear();
    mockOneAuth.initialize.mockClear();
    mockOneAuth.setLogCallback.mockClear();
    mockOneAuth.setLogPiiEnabled.mockClear();
    mockOneAuth.signInInteractively.mockClear();
    mockOneAuth.shutdown.mockClear();
    mockFetch.mockClear();
    (oneAuthService as any).initialized = false;
    (oneAuthService as any).signedInAccount = undefined;
    (oneAuthService as any).signedInARMAccount = undefined;
  });

  it('should sign in and get an access token (happy path)', async () => {
    const result = await oneAuthService.getAccessToken({ targetResource: 'someProtectedResource' });

    // it should have initialized
    expect(mockOneAuth.setLogPiiEnabled).toHaveBeenCalled();
    expect(mockOneAuth.setLogCallback).toHaveBeenCalled();
    expect(mockOneAuth.initialize).toHaveBeenCalled();

    // it should have signed in
    expect(mockOneAuth.signInInteractively).toHaveBeenCalled();
    expect((oneAuthService as any).signedInAccount).toEqual(mockAccount);

    // it should have called acquireCredentialSilently
    expect(mockOneAuth.acquireCredentialSilently).toHaveBeenCalled();

    expect(result.accessToken).toBe(mockCredential.value);
    expect(result.expiryTime).toBe(mockCredential.expiresOn);
  });

  it('should use arm account as account if account not exist', async () => {
    (oneAuthService as any).signedInAccount = undefined;
    (oneAuthService as any).signedInARMAccount = mockAccount;
    const result = await oneAuthService.getAccessToken({ targetResource: 'someProtectedResource' });

    expect(mockOneAuth.signInInteractively).not.toHaveBeenCalled();
    // it should have called acquireCredentialSilently
    expect(mockOneAuth.acquireCredentialSilently).toHaveBeenCalled();

    expect(result.accessToken).toBe(mockCredential.value);
    expect(result.expiryTime).toBe(mockCredential.expiresOn);
  });

  it('should try to acquire a token interactively if interaction is required', async () => {
    mockOneAuth.acquireCredentialSilently.mockRejectedValueOnce({ error: { status: 2 /* Interaction Required */ } });
    const result = await oneAuthService.getAccessToken({ targetResource: 'someProtectedResource' });

    expect(mockOneAuth.acquireCredentialInteractively).toHaveBeenCalled();

    expect(result.accessToken).toBe(mockCredential.value);
    expect(result.expiryTime).toBe(mockCredential.expiresOn);
  });

  it('should throw if there is no targetResource passed as an arg', async () => {
    try {
      await oneAuthService.getAccessToken({ targetResource: undefined } as any);
      throw 'Did not throw expected.';
    } catch (e) {
      expect(e).toBe('Target resource required to get access token.');
    }
  });

  it('should throw if the signed in account does not have an id', async () => {
    try {
      mockOneAuth.signInInteractively.mockReturnValueOnce({ account: { id: undefined } });
      await oneAuthService.getAccessToken({ targetResource: 'someProtectedResource' } as any);
      throw 'Did not throw expected.';
    } catch (e) {
      expect(e).toBe('Signed in account does not have an id.');
    }
  });

  it('should sign out', async () => {
    await oneAuthService.getAccessToken({ targetResource: 'someProtectedResource' });

    // it should have signed in
    expect((oneAuthService as any).signedInAccount).toEqual(mockAccount);

    oneAuthService.signOut();

    expect((oneAuthService as any).signedInAccount).toBeUndefined();
  });

  it('should shut down', async () => {
    await oneAuthService.shutdown();

    expect(mockOneAuth.shutdown).toHaveBeenCalled();
  });

  it('should return the shim on Linux', async () => {
    Object.assign(process.env, { ...process.env, COMPOSER_ENABLE_ONEAUTH: 'true', TEST_IS_LINUX: 'true' });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OneAuthService: service } = require('../../src/auth/oneAuthService');
    const result = await service.getAccessToken({});

    expect(result).toEqual({ accessToken: '', acquiredAt: 0, expiryTime: 99999999999 });
  });

  it('should return the shim in the dev environment without the oneauth env variable set', async () => {
    Object.assign(process.env, {
      ...process.env,
      COMPOSER_ENABLE_ONEAUTH: undefined,
      NODE_ENV: 'development',
      TEST_IS_LINUX: 'false',
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OneAuthService: service } = require('../../src/auth/oneAuthService');
    const result = await service.getAccessToken({});

    expect(result).toEqual({ accessToken: '', acquiredAt: 0, expiryTime: 99999999999 });
    // reset node env
    process.env.NODE_ENV = 'test';
  });

  describe('#getTenants', () => {
    it('should get a list of tenants', async () => {
      const mockTenants = [
        {
          tenantId: 'tenant1',
        },
        {
          tenantId: 'tenant2',
        },
        {
          tenantId: 'tenant3',
        },
      ];
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ value: mockTenants }),
      });
      const tenants = await oneAuthService.getTenants();

      // it should have initialized
      expect(mockOneAuth.setLogPiiEnabled).toHaveBeenCalled();
      expect(mockOneAuth.setLogCallback).toHaveBeenCalled();
      expect(mockOneAuth.initialize).toHaveBeenCalled();

      // it should have signed in
      expect(mockOneAuth.signInInteractively).toHaveBeenCalled();
      expect((oneAuthService as any).signedInARMAccount).toEqual(mockAccount);

      // it should have called the tenants API
      expect(mockFetch).toHaveBeenCalledWith('https://management.azure.com/tenants?api-version=2020-01-01', {
        headers: {
          Authorization: 'Bearer someToken',
        },
      });

      expect(tenants).toBe(mockTenants);
    });

    it('should not attempt to sign in if token already fetched', async () => {
      const mockTenants = [
        {
          tenantId: 'tenant1',
        },
        {
          tenantId: 'tenant2',
        },
        {
          tenantId: 'tenant3',
        },
      ];
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ value: mockTenants }),
      });
      (oneAuthService as any).signedInARMAccount = { some: 'account' };
      (oneAuthService as any).tenantToken = 'cached-token';
      const tenants = await oneAuthService.getTenants();

      // it should have initialized
      expect(mockOneAuth.setLogPiiEnabled).toHaveBeenCalled();
      expect(mockOneAuth.setLogCallback).toHaveBeenCalled();
      expect(mockOneAuth.initialize).toHaveBeenCalled();

      expect(mockOneAuth.signInInteractively).not.toHaveBeenCalled();

      // it should have called the tenants API
      expect(mockFetch).toHaveBeenCalledWith('https://management.azure.com/tenants?api-version=2020-01-01', {
        headers: {
          Authorization: 'Bearer cached-token',
        },
      });

      expect(tenants).toBe(mockTenants);
    });
  });

  it('should throw an error if something goes wrong while getting a list of tenants', async () => {
    mockFetch.mockRejectedValueOnce({ error: 'could not get a list of tenants' });

    await expect(oneAuthService.getTenants()).rejects.toEqual({ error: 'could not get a list of tenants' });
  });

  it('should get an ARM token for a tenant', async () => {
    mockOneAuth.acquireCredentialSilently.mockReturnValueOnce({ credential: { value: 'someARMToken' } });
    (oneAuthService as any).signedInARMAccount = {};
    const result = await oneAuthService.getARMTokenForTenant('someTenant');

    expect(result).toBe('someARMToken');
  });

  it('should get an ARM token for a tenant interactively if interaction is required', async () => {
    mockOneAuth.acquireCredentialInteractively.mockReturnValueOnce({ credential: { value: 'someARMToken' } });
    mockOneAuth.acquireCredentialSilently.mockRejectedValueOnce({ error: { status: 2 /* Interaction Required */ } });
    (oneAuthService as any).signedInARMAccount = {};
    const result = await oneAuthService.getARMTokenForTenant('someTenant');

    expect(mockOneAuth.acquireCredentialInteractively).toHaveBeenCalled();
    expect(result).toBe('someARMToken');
  });

  it('should login first if signedInARMAccount is undefined', async () => {
    (oneAuthService as any).signedInARMAccount = undefined;
    await oneAuthService.getARMTokenForTenant('tenantId');
    // it should have signed in
    expect(mockOneAuth.signInInteractively).toHaveBeenCalled();
    expect((oneAuthService as any).signedInARMAccount).toEqual(mockAccount);
  });

  it('should return an empty string if there is no signed in ARM , and login fail', async () => {
    (oneAuthService as any).signedInARMAccount = undefined;
    mockOneAuth.signInInteractively.mockReturnValueOnce({ account: undefined });
    const result = await oneAuthService.getARMTokenForTenant('someTenant');

    expect((oneAuthService as any).signedInARMAccount).toBeUndefined();
    expect(result).toBe('');
  });

  it('should throw an error if something goes wrong while getting an ARM token', async () => {
    mockOneAuth.acquireCredentialSilently.mockRejectedValueOnce({ error: 'Could not get an ARM token' });
    (oneAuthService as any).signedInARMAccount = {};

    await expect(oneAuthService.getARMTokenForTenant('someTenant')).rejects.toEqual({
      error: 'Could not get an ARM token',
    });
  });
});
