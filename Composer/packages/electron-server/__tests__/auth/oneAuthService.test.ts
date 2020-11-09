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
    signInInteractively: jest.fn().mockResolvedValue({ account: mockAccount }),
    shutdown: jest.fn(),
    AadConfiguration: class AAD {},
    AppConfiguration: class App {},
    AuthParameters: class AP {},
    Status: {
      InteractionRequired: INTERACTION_REQUIRED,
    },
  };
  let oneAuthService = new OneAuthInstance(); // bypass the shim logic
  let processEnvBackup = { ...process.env };

  afterEach(() => {
    process.env = processEnvBackup;
  });

  beforeEach(() => {
    jest.resetModules();
    oneAuthService = new OneAuthInstance();
    (oneAuthService as any)._oneAuth = mockOneAuth;
    mockOneAuth.acquireCredentialInteractively.mockClear();
    mockOneAuth.acquireCredentialSilently.mockClear();
    mockOneAuth.initialize.mockClear();
    mockOneAuth.setLogCallback.mockClear();
    mockOneAuth.setLogPiiEnabled.mockClear();
    mockOneAuth.signInInteractively.mockClear();
    mockOneAuth.shutdown.mockClear();
    (oneAuthService as any).initialized = false;
    (oneAuthService as any).signedInAccount = undefined;
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

  it('should try to acquire a token interactively if interaction is required', async () => {
    mockOneAuth.acquireCredentialSilently.mockReturnValueOnce({ error: { status: INTERACTION_REQUIRED } });
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
  });
});
