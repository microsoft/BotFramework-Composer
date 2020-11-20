// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { SettingsController } from '../settings';
import { Store } from '../../store/store';

Store.set = jest.fn();

let mockRes: Response;

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
});

describe('server settings', () => {
  it('should update user settings', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {
        settings: {
          telemetry: {},
        },
      },
    } as Request;
    await SettingsController.updateUserSettings(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith({ telemetry: {} });
  });

  it('should get user settings', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await SettingsController.getUserSettings(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ telemetry: {} }));
  });
});
