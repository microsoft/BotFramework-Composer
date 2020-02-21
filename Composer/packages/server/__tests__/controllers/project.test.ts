// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ProjectController } from '@src/controllers/project';
import rimraf from 'rimraf';

import { Path } from '../../src/utility/path';

let mockRes: Response;

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
});

afterAll(() => {
  const newBot = Path.resolve(__dirname, '../mocks/samplebots/newBot');
  const saveAsDir = Path.resolve(__dirname, '../mocks/samplebots/saveAsBot');
  // remove the new bot files
  try {
    rimraf.sync(newBot);
    rimraf.sync(saveAsDir);
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
    await ProjectController.getProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No such bot project opened',
    });
  });

  it('should get current project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/bot1') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    await ProjectController.getProject(mockReq, mockRes);
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
    const mockReq = {
      params: {},
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
  it('should update dialog', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'Main', content: '' },
    } as Request;
    await ProjectController.updateDialog(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith(204);
  });
  it('should create dialog', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'test', content: '' },
    } as Request;
    await ProjectController.createDialog(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog', async () => {
    const mockReq = {
      params: { dialogId: 'test' },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeDialog(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lg operation', () => {
  beforeAll(async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/saveAsBot') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
  });

  it('should update lg file', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'common', content: '' },
    } as Request;
    await ProjectController.updateLgFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lg file', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'test1', content: '' },
    } as Request;
    await ProjectController.createLgFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lg file', async () => {
    const mockReq = {
      params: { lgFileId: 'test1' },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeLgFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lu operation', () => {
  beforeAll(async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/saveAsBot') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
  });

  it('should update lu file', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'b', content: '' },
    } as Request;
    await ProjectController.updateLuFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lu file', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { id: 'c', content: '' },
    } as Request;
    await ProjectController.createLuFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lu file', async () => {
    const mockReq = {
      params: { luFileId: 'c' },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeLuFile(mockReq, mockRes);
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
  };
  beforeAll(async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/saveAsBot') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
  });
  it('should update default setting', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { settings: defaultSetting },
    } as Request;

    await ProjectController.updateDefaultSlotEnvSettings(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith('ok');
  });

  it('should update default setting', async () => {
    const mockReq = {
      params: {},
      query: { obfuscate: false },
    } as Request;

    await ProjectController.getDefaultSlotEnvSettings(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith(defaultSetting);
  });
});
