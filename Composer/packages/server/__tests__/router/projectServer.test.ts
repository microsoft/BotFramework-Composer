import path from 'path';

import { projectHandler } from '../../src/router/projectServer';
import { FileStorage } from '../../src/storage/FileStorage';

describe('test project server all method', () => {
  const mockStorage = new FileStorage(path.resolve(__dirname, '../mocks/storage.json'), error => {
    console.log(error);
  });
  const mockSetting = new FileStorage(path.resolve(__dirname, '../mocks/setting.json'), error => {
    console.log(error);
  });

  test('GET /api/projects handler', () => {
    const result = projectHandler.checkOpenBotInStorage(mockStorage, mockSetting);
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
    const openBot = projectHandler.updateOpenBot(mockBody, mockStorage);
    expect(openBot).not.toBeUndefined();
    expect(openBot).toEqual(mockBody);
  });
});
