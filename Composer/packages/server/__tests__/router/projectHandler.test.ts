import path from 'path';

import ProjectHandler from '../../src/handlers/projectHandler';
import setting from '../../src/storage/SettingService';
import storage from '../../src/storage/StorageService';
const mockFilePath: string = path.resolve('packages/server/__tests__/mocks/1.botproj');
const mockStorageHandler = jest.fn(() => ({
  getStorageById: () => ({
    name: 'test',
    type: 'LocalDrive',
    id: 'default',
    path: 'testPath',
  }),
}));

jest.mock('../../src/storage/SettingService', () => {
  const mockSettings: any = {
    openLastActiveBot: true,
    launcherConnector: {
      type: 'CSharp',
      path: '../../../BotLauncher/CSharp',
    },
  };
  return { getItem: (key: string) => mockSettings[key] };
});

jest.mock('azure-storage', () => {
  return {
    createBlobService: (account: string, key: string) => {
      return {
        listContainersSegmented: () => {
          return { containers: [] };
        },
        listBlobsSegmented: () => {
          return { blobs: [] };
        },
      };
    },
  };
});

jest.mock('../../src/storage/StorageService', () => {
  const mockStorage: any = {
    linkedStorages: [
      {
        name: 'test',
        type: 'LocalDrive',
        id: 'default',
        path: 'testPath',
      },
    ],
    recentAccessedBots: [
      {
        path: 'test',
        storageId: 'default',
        lastAccessTime: 1553848431570,
      },
    ],
  };
  return {
    getItem: (key: string) => mockStorage[key],
    setItem: (key: string, data: any) => {
      mockStorage[key] = data;
      console.log('save success');
    },
  };
});

describe('test project server all method', () => {
  beforeEach(() => {
    mockStorageHandler.mockClear();
  });
  test('GET /api/projects handler', () => {
    const projectHandler = new ProjectHandler(storage, setting, true);
    const result = projectHandler.getOpenBot();
    expect(result).not.toBeUndefined();
    expect(result.path).toBeDefined();
    expect(result.storageId).toBe('default');
  });

  test('PUT /api/projects handler', () => {
    const mockBody = {
      path: mockFilePath,
      storageId: 'default',
      lastAccessTime: Date.now(),
    };
    const projectHandler = new ProjectHandler(storage, setting, true);
    const openBot = projectHandler.updateOpenBot(mockBody);
    expect(openBot).not.toBeUndefined();
  });
});
