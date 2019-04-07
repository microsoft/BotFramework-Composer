import ProjectHandler from '../../src/handlers/projectHandler';
import setting from '../../src/storage/SettingService';
import storage from '../../src/storage/StorageService';
// import path from 'path';

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

jest.mock('../../src/storage/StorageService', () => {
  const path = require('path');
  const mockFilePath: string = path.resolve('../mocks/1.botproj');
  const mockStorage: any = {
    linkedStorages: [
      {
        name: 'test',
        type: 'LocalDrive',
        id: 'default',
        path: 'testPath',
      },
    ],
    lastActiveBot: '../../../../SampleBots/Planning - ToDoLuisBot/bot.botproj',
    recentAccessedBots: [
      {
        path: mockFilePath,
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
  const path = require('path');
  const mockFilePath: string = path.resolve('../mocks/1.botproj');
  test('GET /api/projects handler', () => {
    const projectHandler = new ProjectHandler(storage, setting, true);
    const result = projectHandler.getOpenBot();
    expect(result).not.toBeUndefined();
    expect(result.path).toBe(mockFilePath.replace(/\\/g, '/'));
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
