// import azure from 'azure-storage';

import StorageHandler, { IStorageItem } from '../../src/handlers/storageHandler';
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
      {
        name: 'Azure Blob',
        type: 'AzureBlob',
        id: 'azure',
        account: 'test',
        key: 'test',
      },
    ],
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
// jest.mock('azure-storage', () => {
//   return {
//     createBlobService: (account: string, key: string) => {
//       return {
//         listContainersSegmented: () => {
//           return { containers: [] };
//         },
//         listBlobsSegmented: () => {
//           return { blobs: [] };
//         },
//       };
//     },
//   };
// });
const storageHandler = new StorageHandler(storage);
describe('test storage server all method', () => {
  test('GET /api/storages handler', () => {
    const result = storageHandler.getStorage();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('test');
  });

  test('GET /api/storages/:id? handler', () => {
    const result = storageHandler.getStorageById('default');
    expect(result).not.toBeNull();
    expect((result as IStorageItem).name).toBe('test');
  });

  test('test get folder in one storage', () => {
    const result = storageHandler.getFolderTree(__dirname);
    expect(result.length).toBeGreaterThan(0);
  });

  // test('test listContainers', () => {
  //   const result = storageHandler.getFilesAndFolders(mockService);
  //   expect(result).not.toBeUndefined();
  // });

  // test('test listBlobs', () => {
  //   const mockService = azure.createBlobService('test', 'test');
  //   const result = storageHandler.getContainersOrBlobs(mockService, 'azure');
  //   expect(result).not.toBeUndefined();
  // });
});
