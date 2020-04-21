// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import rimraf from 'rimraf';

import { BotProjectService } from '../../src/services/project';
import { ProjectController } from '../../src/controllers/project';
import { Path } from '../../src/utility/path';

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

describe('getProject', () => {
  it('should get no project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await ProjectController.getProjectById(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'project not found in cache',
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
      message: 'file not exist wrong/path',
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
    const mockReq = {
      params: { projectId },
      query: {},
      body: { storageId: 'default', location: saveAsDir, description: '', name: 'saveAsBot' },
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
      body: { storageId: 'default', location: newBotDir, description: '', name: name, templateId: '' },
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
      body: { name: 'test.dialog', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog', async () => {
    const mockReq = {
      params: { name: 'test.dialog', projectId },
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
      body: { name: 'test1.lg', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lg file', async () => {
    const mockReq = {
      params: { name: 'test1.lg', projectId },
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
      body: { name: 'c.lu', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lu file', async () => {
    const mockReq = {
      params: { name: 'c.lu', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('setting operation', () => {
  const defaultSetting = {
    MicrosoftAppId: '',
    luis: {
      name: 'test',
      authoringRegion: 'westus',
      defaultLanguage: 'en-us',
      environment: 'composer',
    },
    qna: {
      knowledgebaseid: '',
      endpointkey: '',
      hostname: '',
    },
    downsampling: {
      maxImbalanceRatio: 10,
      maxUtteranceAllowed: 15000,
    },
  };
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });
  it('should update default setting', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { settings: defaultSetting },
    } as Request;

    await ProjectController.updateDefaultSlotEnvSettings(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith('ok');
  });

  it('should update default setting', async () => {
    const mockReq = {
      params: { projectId },
      query: { obfuscate: false },
    } as Request;

    await ProjectController.getDefaultSlotEnvSettings(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith(defaultSetting);
  });
});
