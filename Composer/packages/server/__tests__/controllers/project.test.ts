// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ProjectController } from '@src/controllers/project';
import rimraf from 'rimraf';

import { Path } from '../../src/utility/path';
let mockRes: Response;

// offer a bot project ref which to open
jest.mock('../../src/store/store', () => {
  const data = {
    storageConnections: [
      {
        id: 'default',
        name: 'This PC',
        type: 'LocalDisk',
        path: '.',
        defaultPath: '.',
      },
    ],
    recentBotProjects: [] as any[],
  } as any;
  return {
    Store: {
      get: (key: string) => {
        return data[key];
      },
      set: (key: string, value: any) => {
        data[key] = value;
      },
    },
  };
});

// jest.mock('../../models/asset/assetManager', () => {
//   return jest.fn().mockImplementation(() => {
//     return { copyProjectTemplateTo: () => {} };
//   });
// });

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
});

describe('create a new project', () => {
  const newBotDir = Path.resolve(__dirname, '../mocks/samplebots/newBot');
  it('should create a new project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', location: newBotDir, description: '', name: 'newBot', templateId: 'EmptyBot' },
    } as Request;
    await ProjectController.createProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    // remove the saveas files
    try {
      rimraf.sync(newBotDir);
    } catch (error) {
      throw new Error(error);
    }
  });
});

// describe('getProject', () => {
//   it('should get no project', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: {},
//     } as Request;
//     await ProjectController.getProject(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(404);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       message: 'No such bot project opened',
//     });
//   });

//   it('should get current project', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/bot1') },
//     } as Request;
//     await ProjectController.openProject(mockReq, mockRes);
//     await ProjectController.getProject(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//   });
// });

// describe('should open bot', () => {
//   it('should fail to open an unexisting bot', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: { storageId: 'default', path: 'wrong/path' },
//     } as Request;
//     await ProjectController.openProject(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       message: 'file not exist wrong/path',
//     });
//   });

//   it('should open bot2', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: { storageId: 'default', path: Path.resolve(__dirname, '../mocks/samplebots/bot2') },
//     } as Request;
//     await ProjectController.openProject(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//   });
// });

// describe('should save as bot', () => {
//   const saveAsDir = Path.resolve(__dirname, '../mocks/samplebots/saveAsBot');
//   it('saveProjectAs', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: { storageId: 'default', location: saveAsDir, description: '', name: 'saveAsBot' },
//     } as Request;
//     await ProjectController.saveProjectAs(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     // remove the saveas files
//     try {
//       rimraf.sync(saveAsDir);
//     } catch (error) {
//       throw new Error(error);
//     }
//   });
// });

// describe('should get recent projects', () => {
//   it('should get recent projects', async () => {
//     const mockReq = {
//       params: {},
//       query: {},
//       body: {},
//     } as Request;
//     await ProjectController.getRecentProjects(mockReq, mockRes);
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//   });
// });
