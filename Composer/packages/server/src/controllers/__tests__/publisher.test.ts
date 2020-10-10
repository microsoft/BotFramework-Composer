// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { Request, Response } from 'express';
import rimraf from 'rimraf';
import { ExtensionContext } from '@bfc/extension';

import { BotProjectService } from '../../services/project';
import { Path } from '../../utility/path';
import { PublishController } from '../../controllers/publisher';

const pluginDir = path.resolve(__dirname, '../../../../../plugins');

let mockRes: Response;

const useFortest = Path.resolve(__dirname, '../../__mocks__/samplebots/testPublish');
const bot1 = Path.resolve(__dirname, '../../__mocks__/samplebots/bot1');

const location1 = {
  storageId: 'default',
  path: bot1,
};

const location2 = {
  storageId: 'default',
  path: useFortest,
};

beforeEach(async () => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;

  const currentProjectId = await BotProjectService.openProject(location1);
  const currentProject = await BotProjectService.getProjectById(currentProjectId);
  await BotProjectService.saveProjectAs(currentProject, location2);
});

beforeAll(async () => {
  await ExtensionContext.loadPluginsFromFolder(pluginDir);
});

afterEach(() => {
  // remove the new bot files
  try {
    rimraf.sync(useFortest);
  } catch (error) {
    throw new Error(error);
  }
});

describe('get types', () => {
  it('should get types', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await PublishController.getTypes(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalled();
  });
});

describe('status', () => {
  const target = 'default';

  it('should get status', async () => {
    const projectId = await BotProjectService.openProject(location2);

    const mockReq = {
      params: { projectId, target },
      query: {},
      body: {},
    } as Request;
    await PublishController.status(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

//TODO: verify history not empty;
describe('history', () => {
  let projectId = '';
  const target = 'default';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should get history', async () => {
    const mockReq = {
      params: { projectId, target },
      query: {},
      body: {},
    } as Request;
    await PublishController.history(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});

//TODO: verify history not empty;
describe('rollback', () => {
  let projectId = '';
  const target = 'default';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should get status', async () => {
    const mockReq = {
      params: { projectId, target },
      query: {},
      body: {},
    } as Request;
    await PublishController.rollback(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
