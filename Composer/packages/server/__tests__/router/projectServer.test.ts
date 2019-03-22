import { projectHandler } from '../../src/router/projectServer';
import { FileStorage } from '../../src/storage/FileStorage';
import path from 'path';

describe('test project server all method', () => {
  let mockStorage = new FileStorage(path.resolve(__dirname, '../mockFile/storage.json'), error => {
    console.log(error);
  });
  let mockSetting = new FileStorage(path.resolve(__dirname, '../mockFile/setting.json'), error => {
    console.log(error);
  });

  test('GET /api/projects handler', () => {
    let result = projectHandler.checkOpenBotInStorage(mockStorage, mockSetting);
    expect(result).not.toBeUndefined();
    expect(result.path).toBe('testPath');
    expect(result.storageId).toBe('default');
  });

  test('PUT /api/projects handler', () => {
    let openBot;
    let mockBody = {
      path: 'testPath',
      storageId: 'default',
    };
    openBot = projectHandler.updateOpenBot(mockBody, mockStorage);
    expect(openBot).not.toBeUndefined();
    expect(openBot).toEqual(mockBody);
  });
});
