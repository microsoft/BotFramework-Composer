// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

describe('auth service', () => {
  const nodeEnvBackup = process.env.NODE_ENV;

  afterAll(() => {
    Object.assign(process.env, { ...process.env, NODE_ENV: nodeEnvBackup });
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('should generate a CSRF token in the production environment', () => {
    Object.assign(process.env, { ...process.env, NODE_ENV: 'production' });
    const { authService } = require('../auth/auth');

    // eslint-disable-next-line no-underscore-dangle
    expect((authService as any)._csrfToken).toBeTruthy();
  });

  it('should use template as a CSRF token in the development environment', () => {
    Object.assign(process.env, { ...process.env, NODE_ENV: 'development' });
    const { authService } = require('../auth/auth');

    // eslint-disable-next-line no-underscore-dangle
    expect((authService as any)._csrfToken).toEqual('<?= __csrf__ ?>');
  });

  it('should get an access token', async () => {
    const mockProvider = {
      getAccessToken: jest.fn().mockResolvedValue('accessToken'),
    };
    const { authService } = require('../auth/auth');
    (authService as any).provider = mockProvider;
    const token = await authService.getAccessToken({});

    expect(token).toBe('accessToken');
  });
});
