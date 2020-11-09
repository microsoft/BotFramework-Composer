// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { csrfProtection } from '../csrfProtection';

jest.mock('../../services/auth/auth', () => ({
  authService: {
    csrfToken: 'csrfToken',
  },
}));

describe('CSRF protection middleware', () => {
  const chainedRes = {
    send: jest.fn(),
  };
  const mockRes: any = {
    status: jest.fn().mockReturnValue(chainedRes),
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    chainedRes.send.mockClear();
    mockRes.status.mockClear();
    mockNext.mockClear();
  });

  it('should fail if the CSRF token is missing from the request', () => {
    const mockReq: any = {
      get: jest.fn().mockReturnValue(undefined),
    };
    csrfProtection(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(chainedRes.send).toHaveBeenCalledWith({ message: 'CSRF token required.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should fail if the CSRF token provided does not match the generated token', () => {
    const mockReq: any = {
      get: jest.fn().mockReturnValue('nonMatchingToken'),
    };
    csrfProtection(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(chainedRes.send).toHaveBeenCalledWith({ message: `CSRF token did not match server's token.` });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call the next req handler if the CSRF token matches', () => {
    const mockReq: any = {
      get: jest.fn().mockReturnValue('csrfToken'),
    };
    csrfProtection(mockReq, mockRes, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(chainedRes.send).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
