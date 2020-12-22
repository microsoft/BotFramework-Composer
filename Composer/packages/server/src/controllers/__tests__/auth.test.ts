// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthController } from '../auth';

const mockGetAccessToken = jest.fn().mockResolvedValue('accessToken');
jest.mock('../../services/auth/auth', () => ({
  authService: {
    getAccessToken: (params) => mockGetAccessToken(params),
  },
}));

let mockIsElectron = true;
jest.mock('../../utility/isElectron', () => ({
  get isElectron() {
    return mockIsElectron;
  },
}));

describe('auth controller', () => {
  const chainedRes = {
    json: jest.fn(),
    send: jest.fn(),
  };
  const mockRes: any = {
    status: jest.fn().mockReturnValue(chainedRes),
  };

  beforeEach(() => {
    mockRes.status?.mockClear();
    chainedRes.json.mockClear();
    chainedRes.send.mockClear();
  });

  it('should return a 400 if no targetResource is passed in Electron env', async () => {
    mockIsElectron = true;
    const mockReq: any = {
      query: {
        targetResource: undefined,
      },
    };
    await AuthController.getAccessToken(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(chainedRes.send).toHaveBeenCalledWith(
      'Must pass a "targetResource" parameter to perform authentication in Electron environment.'
    );
  });

  it('should return a 400 if no clientId is passed in web env', async () => {
    mockIsElectron = false;
    const mockReq: any = {
      query: {
        clientId: undefined,
      },
    };
    await AuthController.getAccessToken(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(chainedRes.send).toHaveBeenCalledWith(
      'Must pass a "clientId" parameter to perform authentication in a Web environment.'
    );
  });

  it('should return an access token from the auth service', async () => {
    mockIsElectron = true;
    const mockReq: any = {
      query: {
        targetResource: 'https://graph.microsoft.com/',
      },
    };
    await AuthController.getAccessToken(mockReq, mockRes);

    expect(mockGetAccessToken).toHaveBeenCalledWith({
      clientId: undefined,
      targetResource: 'https://graph.microsoft.com/',
      scopes: [],
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(chainedRes.json).toHaveBeenCalledWith({ accessToken: 'accessToken' });
  });
});
