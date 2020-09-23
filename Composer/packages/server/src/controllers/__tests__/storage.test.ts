// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import StorageService from '../../services/storage';
import { StorageController } from '../../controllers/storage';

jest.mock('../../services/storage', () => ({
  getBlob: jest.fn(),
}));

let mockReq: Request;
let mockRes: Response;

beforeEach(() => {
  mockReq = {
    params: {},
    query: {},
    body: {},
  } as Request;

  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
});

describe('getBlob', () => {
  beforeEach(() => {
    mockReq.params.storageId = 'default';
  });

  it('returns 400 when path query not present', async () => {
    await StorageController.getBlob(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'path missing from query' });
  });

  it('returns 400 when path is not absolute', async () => {
    mockReq.query.path = 'some/path';
    await StorageController.getBlob(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'path must be absolute' });
  });

  it('returns blob for absolute path', async () => {
    mockReq.query.path = '/some/path';
    (StorageService.getBlob as jest.Mock).mockResolvedValue('some blob');
    await StorageController.getBlob(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith('some blob');
  });
});
