import { storageHandler } from '../../src/router/storageServer';
import storage from '../../src/storage/StorageService';

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

describe('test storage server all method', () => {
  test('GET /api/storages handler', () => {
    const result = storageHandler.getStorage(storage);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('test');
  });

  test('test get folder in one storage', () => {
    const result = storageHandler.getFolderTree('./../../');
    expect(result.length).toBeGreaterThan(0);
  });

  test('get folders and files', async () => {
    const mockResponse: any = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(() => mockResponse),
    };
    const mockreq: any = {
      params: {
        path: __dirname,
      },
    };
    await storageHandler.getFilesAndFolders(mockreq, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
