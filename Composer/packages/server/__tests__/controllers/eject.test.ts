// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import rimraf from 'rimraf';
import { pluginLoader } from '@bfc/plugin-loader';

import { BotProjectService } from '../../src/services/project';
import { Path } from '../../src/utility/path';
import { EjectController } from '../../src/controllers/eject';

jest.mock('@bfc/plugin-loader', () => {
  return {
    pluginLoader: {
      extensions: {
        botTemplates: [],
        baseTemplates: [],
        runtimeTemplates: [],
      },
    },
    PluginLoader: {
      getUserFromRequest: jest.fn(),
    },
  };
});

let mockRes: Response;

const useFortest = Path.resolve(__dirname, '../mocks/samplebots/testEject');
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
  pluginLoader.extensions.runtimeTemplates.push({
    key: 'azurewebapp',
    name: 'C#',
    startCommand: 'dotnet run --project azurewebapp',
    path: './',
    eject: jest.fn(),
    build: jest.fn(),
    run: jest.fn(),
    buildDeploy: jest.fn(),
    setSkillManifest: jest.fn(),
  });
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

describe('get bot project templates', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should project templates', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: (data) => {
        expect(data.length).toEqual(1);
      },
      send: jest.fn().mockReturnThis(),
    } as any;
    await EjectController.getTemplates(mockReq, mockRes);
  });

  it('should eject runtime', async () => {
    const mockReq = {
      params: { projectId, template: 'azurewebapp' },
      query: {},
      body: {},
    } as Request;
    await EjectController.eject(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
      })
    );
  });

  it('should not eject runtime if template not exist', async () => {
    const mockReq = {
      params: { projectId, template: 'fooapp' },
      query: {},
      body: {},
    } as Request;
    await EjectController.eject(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'template not found',
      })
    );
  });
});
