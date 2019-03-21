import { storageHandler } from '../../src/router/storageServer';
import { FileStorage } from '../../src/storage/FileStorage';
import path from 'path';

describe('test storage server all method', () => {
  let mockStorage = new FileStorage(path.resolve(__dirname, '../mockFile/storage.json'), error => {
    console.log(error);
  });

  test('GET /api/storages handler', () => {
    let result = storageHandler.getStorage(mockStorage);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('test');
  });

  test('test get folder in one storage', () => {
    let result = storageHandler.getFolderTree(__dirname);
    expect(result.length).toBeGreaterThan(0);
  });
});
