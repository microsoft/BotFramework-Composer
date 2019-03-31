import path from 'path';

import { projectHandler } from '../../src/router/projectServer';
import setting from '../../src/storage/SettingService';
import storage from '../../src/storage/StorageService';

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
        path: 'testPath.bot',
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
  test('GET /api/projects handler', () => {
    const result = projectHandler.checkOpenBotInStorage(storage, setting);
    expect(result).not.toBeUndefined();
    expect(result.path).toBe(path.resolve('testPath.bot'));
    expect(result.storageId).toBe('default');
  });

  test('PUT /api/projects handler', () => {
    const mockBody = {
      path: path.resolve('testPath.bot'),
      storageId: 'default',
      lastAccessTime: Date.now(),
    };
    const openBot = projectHandler.updateOpenBot(mockBody, storage);
    expect(openBot).not.toBeUndefined();
    expect(openBot).toEqual(mockBody);
  });
});
