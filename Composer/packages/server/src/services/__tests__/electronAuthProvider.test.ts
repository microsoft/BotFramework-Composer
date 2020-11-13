// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ElectronAuthProvider } from '../auth/electronAuthProvider';

let mockIsLinux = false;
jest.mock('../../utility/platform', () => ({
  isLinux: () => mockIsLinux,
}));

describe('Electron auth provider', () => {
  beforeEach(() => {
    mockIsLinux = false;
  });

  it('should not return an access token on Linux', async () => {
    mockIsLinux = true;
    const provider = new ElectronAuthProvider({});
    // eslint-disable-next-line no-underscore-dangle
    (provider as any)._electronContext = {
      getAccessToken: jest.fn().mockResolvedValue('accessToken'),
    };
    const token = await provider.getAccessToken({} as any);

    expect(token).toBe('');
  });

  it('should return a fresh access token on Win / Mac', async () => {
    const provider = new ElectronAuthProvider({});
    const mockElectronContext = {
      getAccessToken: jest.fn().mockResolvedValue({
        accessToken: 'accessToken',
      }),
    };
    // eslint-disable-next-line no-underscore-dangle
    (provider as any)._electronContext = mockElectronContext;
    const token = await provider.getAccessToken({ targetResource: 'https://graph.microsoft.com/' });

    expect(mockElectronContext.getAccessToken).toHaveBeenCalledWith({ targetResource: 'https://graph.microsoft.com/' });
    expect(token).toBe('accessToken');
  });

  it('should return a cached token', async () => {
    const targetResource = 'https://graph.microsoft.com/';
    const provider = new ElectronAuthProvider({});
    const mockElectronContext = {
      getAccessToken: jest.fn().mockResolvedValue({
        accessToken: 'accessToken',
      }),
    };
    // eslint-disable-next-line no-underscore-dangle
    (provider as any)._electronContext = mockElectronContext;
    (provider as any).tokenCache = {
      [targetResource]: {
        accessToken: 'cachedToken',
        expiryTime: Date.now() + 1000 * 60 * 30, // expires 30 minutes from now
      },
    };
    const token = await provider.getAccessToken({ targetResource });

    expect(mockElectronContext.getAccessToken).not.toHaveBeenCalled();
    expect(token).toBe('cachedToken');
  });
});
