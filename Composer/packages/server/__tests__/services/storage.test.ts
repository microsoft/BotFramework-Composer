import { Path } from '../../src/utility/path';
import StorageService from '../../src/services/storage';
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
jest.mock('../../src/store/store', () => {
  const data = [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: '.',
    },
  ];
  return {
    Store: {
      get: (key: string) => data,
      set: (key: string, value: any) => {
        console.log(`set ${value} in store`);
      },
    },
  };
});
describe('test StorageService', () => {
  it('getStorageConnections', () => {
    const result = StorageService.getStorageConnections();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe('default');
    expect(result[0].type).toBe('LocalDisk');
    expect(result[0].path).toBe(Path.resolve('.'));
  });
  it('checkBlob', async () => {
    const result = await StorageService.checkBlob('default', Path.resolve('.'));
    expect(result).toBeTruthy();
  });
  it('getBlob', async () => {
    const result = await StorageService.getBlob('default', Path.resolve('.'));
    expect(result).not.toBeUndefined();
    expect(result.children).not.toBeUndefined();
  });
});
