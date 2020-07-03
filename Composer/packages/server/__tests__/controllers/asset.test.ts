// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { AssetController } from '../../src/controllers/asset';

let mockRes: Response;

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
});

describe('get bot project templates', () => {
  it('should project templates', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await AssetController.getProjTemplates(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
