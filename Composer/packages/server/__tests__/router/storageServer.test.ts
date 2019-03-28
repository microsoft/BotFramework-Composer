import path from 'path';

import { storageHandler } from '../../src/router/storageServer';
import { FileStorage } from '../../src/storage/FileStorage';

describe('test storage server all method', () => {
  const mockStorage = new FileStorage(path.resolve(__dirname, '../mocks/storage.json'), error => {
    console.log(error);
  });

  test('GET /api/storages handler', () => {
    const result = storageHandler.getStorage(mockStorage);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('test');
  });

  test('test get folder in one storage', () => {
    const result = storageHandler.getFolderTree(__dirname);
    expect(result.length).toBeGreaterThan(0);
  });
});
