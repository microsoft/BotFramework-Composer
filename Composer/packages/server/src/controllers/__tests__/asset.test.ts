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

const mockFetchResponse = {
  id: 'generator-conversational-core',
  _rev: '9-82a6c228b16649a143a49974b0adc022',
  name: 'generator-conversational-core',
  readme: '# Mock readme markdown',
};

jest.mock('../../utility/fetch', () => () => {
  return Promise.resolve({ json: () => mockFetchResponse });
});

describe('getTemplateReadMe', () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };

    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockRes.send.mockClear();
    mockRes.sendStatus.mockClear();
  });

  const mockReq = {
    params: {},
    query: { moduleName: 'generator-conversational-core' },
    body: {},
  } as Request;

  it('should return a readMe', async () => {
    await AssetController.getTemplateReadMe(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith('# Mock readme markdown');
  });
});
