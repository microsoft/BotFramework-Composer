// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as jwt from 'jsonwebtoken';
import { decode } from 'jsonwebtoken';

import {
  usGovernmentAuthentication,
  authentication,
  v32Authentication,
  v31Authentication,
} from '../../utils/constants';
import { createBotFrameworkAuthenticationMiddleware } from '../createBotFrameworkAuthentication';

const mockGetKey = jest.fn().mockResolvedValue(`openIdMetadataKey`);
jest.mock('../../utils/openIdMetaData', () => ({
  OpenIdMetadata: jest.fn().mockImplementation(() => ({
    getKey: mockGetKey,
  })),
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
  verify: jest.fn(),
}));

describe('botFrameworkAuthenticationMiddleware', () => {
  const authMiddleware = createBotFrameworkAuthenticationMiddleware();
  const mockNext: any = jest.fn(() => null);
  const mockEnd = jest.fn(() => null);
  const mockStatus = jest.fn(() => {
    return { end: mockEnd };
  });
  let mockPayload;

  beforeEach(() => {
    mockNext.mockClear();
    mockEnd.mockClear();
    mockStatus.mockClear();
    (decode as jest.Mock).mockClear();
    (jwt.verify as jest.Mock).mockClear();
    (decode as jest.Mock).mockImplementation(() => ({
      header: {
        kid: 'someKeyId',
      },
      payload: mockPayload,
    }));
    (jwt.verify as jest.Mock).mockReturnValue('verifiedJwt');
    mockGetKey.mockClear();
  });

  it('should call the next middleware and return if there is no auth header', async () => {
    const mockHeader = jest.fn(() => false);
    const req: any = {
      get: mockHeader,
    };
    const res: any = jest.fn();
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(mockHeader).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return a 401 if the token is not provided in the header', async () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(mockHeader).toHaveBeenCalled();
    expect(jwt.decode).toHaveBeenCalledWith('someToken', { complete: true });
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should return a 401 if a government bot provides a token in an unknown format', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '99.9',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should authenticate with a v1.0 gov token', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: usGovernmentAuthentication.botTokenAudience,
      clockTolerance: 300,
      issuer: usGovernmentAuthentication.tokenIssuerV1,
    });
    expect(req.jwt).toBe('verifiedJwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should authenticate with a v2.0 gov token', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '2.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: usGovernmentAuthentication.botTokenAudience,
      clockTolerance: 300,
      issuer: usGovernmentAuthentication.tokenIssuerV2,
    });
    expect(req.jwt).toBe('verifiedJwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return a 401 if verifying a gov jwt token fails', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('unverifiedJwt');
    });
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: usGovernmentAuthentication.botTokenAudience,
      clockTolerance: 300,
      issuer: usGovernmentAuthentication.tokenIssuerV1,
    });
    expect(req.jwt).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it(`should return a 500 if a bot's token can't be retrieved from openId metadata`, async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    // key should come back as falsy
    mockGetKey.mockResolvedValueOnce(null);
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should return a 401 if a bot provides a token in an unknown format', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '99.9',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should authenticate with a v1.0 token', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v32Authentication.tokenIssuerV1,
    });
    expect(req.jwt).toBe('verifiedJwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should authenticate with a v2.0 token', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '2.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v32Authentication.tokenIssuerV2,
    });
    expect(req.jwt).toBe('verifiedJwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should attempt authentication with v3.1 characteristics if v3.2 auth fails', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    // verification attempt with v3.2 token characteristics should fail
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('unverifiedJwt');
    });
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledTimes(2);
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v32Authentication.tokenIssuerV1,
    });
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v31Authentication.tokenIssuer,
    });
    expect(req.jwt).toBe('verifiedJwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return a 401 if auth with both v3.1 & v3.2 token characteristics fail', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = {
      get: mockHeader,
    };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    (jwt.verify as jest.Mock)
      // verification attempt with v3.2 token characteristics should fail
      .mockImplementationOnce(() => {
        throw new Error('unverifiedJwt');
      })
      // second attempt with v3.1 token characteristics should also fail
      .mockImplementationOnce(() => {
        throw new Error('unverifiedJwt');
      });
    const result = await authMiddleware(req, res, mockNext);

    expect(result).toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledTimes(2);
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v32Authentication.tokenIssuerV1,
    });
    expect(jwt.verify).toHaveBeenCalledWith('someToken', 'openIdMetadataKey', {
      audience: authentication.botTokenAudience,
      clockTolerance: 300,
      issuer: v31Authentication.tokenIssuer,
    });
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
    expect(req.jwt).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });
});
