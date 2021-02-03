// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { AssetController } from '../asset';

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

describe('get feed driven bot project templates', () => {
  it('should get project templates', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {
        feedUrls: [
          'https://registry.npmjs.org/-/v1/search?text=conversationalcore&size=100&from=0&quality=0.65&popularity=0.98&maintenance=0.5',
        ],
        getFirstPartyNpm: false,
      },
    } as Request;
    await AssetController.getProjTemplatesV2(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
