// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import rimraf from 'rimraf';
import { pluginLoader } from '@bfc/plugin-loader';

import { BotProjectService } from '../../src/services/project';
import { ProjectController } from '../../src/controllers/project';
import { Path } from '../../src/utility/path';

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

const mockSampleBotPath = Path.join(__dirname, '../mocks/asset/projects/SampleBot');

let mockRes: Response;

const newBot = Path.resolve(__dirname, '../mocks/samplebots/newBot');
const saveAsDir = Path.resolve(__dirname, '../mocks/samplebots/saveAsBot');
const useFortest = Path.resolve(__dirname, '../mocks/samplebots/test');
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
  pluginLoader.extensions.botTemplates.push({
    id: 'SampleBot',
    name: 'Sample Bot',
    description: 'Sample Bot',
    path: mockSampleBotPath,
  });
  const currentProjectId = await BotProjectService.openProject(location1);
  const currentProject = await BotProjectService.getProjectById(currentProjectId);
  await BotProjectService.saveProjectAs(currentProject, location2);
});

afterAll(() => {
  // remove the new bot files
  try {
    rimraf.sync(newBot);
    rimraf.sync(saveAsDir);
    rimraf.sync(useFortest);
  } catch (error) {
    throw new Error(error);
  }
});

describe('get bot project', () => {
  it('should get no project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await ProjectController.getProjectById(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'project undefined not found in cache',
    });
  });

  it('should get current project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/bot1') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('get all projects', () => {
  it('should get all project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots') },
    } as Request;
    await ProjectController.getAllProjects(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('open bot operation', () => {
  it('should fail to open an unexisting bot', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: 'wrong/path' },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'file wrong/path does not exist',
    });
  });

  it('should open bot1', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/bot1') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('should save as bot', () => {
  const saveAsDir = Path.resolve(__dirname, '../mocks/samplebots/');
  it('saveProjectAs', async () => {
    const projectId = await BotProjectService.openProject(location1);
    const schemaUrl = 'http://json-schema.org/draft-07/schema#';
    const mockReq = {
      params: { projectId },
      query: {},
      body: { storageId: 'default', location: saveAsDir, description: '', name: 'saveAsBot', schemaUrl },
    } as Request;
    await ProjectController.saveProjectAs(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    // remove the saveas files
  });
});

describe('should get recent projects', () => {
  it('should get recent projects', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await ProjectController.getRecentProjects(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('create a Empty Bot project', () => {
  it('should create a new project', async () => {
    const newBotDir = Path.resolve(__dirname, '../mocks/samplebots/');
    const name = 'newBot';
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', location: newBotDir, description: '', name: name, templateId: 'SampleBot' },
    } as Request;
    await ProjectController.createProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
//current opened bot is the newBot
describe('dialog operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });
  it('should update dialog', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'bot1.dialog', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
  it('should create dialog', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog', async () => {
    const mockReq = {
      params: { name: 'test2.dialog', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

//current opened bot is the newBot
describe('dialog schema operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should create dialog schema', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog.schema', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should update dialog schema', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog.schema', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog schema', async () => {
    const mockReq = {
      params: { name: 'test2.dialog.schema', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lg operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should update lg file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'common.en-us.lg', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lg file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test1.en-us.lg', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lg file', async () => {
    const mockReq = {
      params: { name: 'test1.en-us.lg', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lu operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should update lu file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'b.en-us.lu', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lu file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'c.en-us.lu', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lu file', async () => {
    const mockReq = {
      params: { name: 'c.en-us.lu', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('skill operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should check skill url', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {
        url: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
      },
    } as Request;
    await ProjectController.getSkill(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  }, 10000);

  it('should update skill', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {
        skills: [
          {
            manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
          },
        ],
      },
    } as Request;
    await ProjectController.updateSkill(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  }, 5000);

  it('should update skill, remove', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {
        skills: [],
      },
    } as Request;
    await ProjectController.updateSkill(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

// TODO: add a success publish test.
describe('publish luis files', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location1);
  });

  it('should publish all luis & qna files', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {
        authoringKey: '0d4991873f334685a9686d1b48e0ff48',
        projectId: projectId,
        crossTrainConfig: {
          rootIds: ['bot1.en-us.lu'],
          triggerRules: { 'bot1.en-us.lu': {} },
          intentName: '_Interruption',
          verbose: true,
        },
        luFiles: [],
      },
    } as Request;
    await ProjectController.build(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('remove project', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should remove current project', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
