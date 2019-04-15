import StorageService from '../../src/services/storage';
import path from 'path';
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
    expect(result[0].path).toBe(path.resolve('.'));
  });
  it('checkBlob', () => {
    const result = StorageService.checkBlob('default', path.resolve('.'));
    expect(result).toBeTruthy();
  });
  it('getBlob', () => {
    const result = StorageService.getBlob('default', path.resolve('.'));
    expect(result).not.toBeUndefined();
    expect(result.children).not.toBeUndefined();
  });
});
