// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import rimraf from 'rimraf';

import { BotProjectService } from '../../src/services/project';
import { Path } from '../../src/utility/path';
import { PublishController } from '../../src/controllers/publisher';

jest.mock('@bfc/plugin-loader', () => {
  return {
    pluginLoader: {
      extensions: {
        botTemplates: [],
        baseTemplates: [],
        publish: [],
      },
    },
    PluginLoader: {
      getUserFromRequest: jest.fn(),
    },
  };
});

let mockRes: Response;

const useFortest = Path.resolve(__dirname, '../mocks/samplebots/testPublish');
const bot1 = Path.resolve(__dirname, '../mocks/samplebots/bot1');

const location1 = {
  storageId: 'default',
  path: bot1,
};

const location2 = {
  storageId: 'default',
  path: useFortest,
};

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
});

beforeAll(async () => {
  const currentProjectId = await BotProjectService.openProject(location1);
  const currentProject = await BotProjectService.getProjectById(currentProjectId);
  await BotProjectService.saveProjectAs(currentProject, location2);
});

afterAll(() => {
  // remove the new bot files
  try {
    rimraf.sync(useFortest);
  } catch (error) {
    throw new Error(error);
  }
});

describe('get types', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should get types', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {},
    } as Request;
    await PublishController.getTypes(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });
});

describe('publish', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should publish luis files', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {},
    } as Request;
    await PublishController.publish(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
