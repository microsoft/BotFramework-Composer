// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import luFileStatusStorage from '../../src/utils/luFileStatusStorage';

const fileIds = ['1', '2', '3', '4'];
const botName = 'test_status';

afterAll(() => luFileStatusStorage.removeAllStatuses(botName));

describe('luFileStatusStorage', () => {
  it('check file status', () => {
    luFileStatusStorage.checkFileStatus(botName, fileIds);
    expect(Object.keys(luFileStatusStorage.get(botName)).length).toEqual(4);
  });

  it('the statuses after publishing', () => {
    luFileStatusStorage.publishAll(botName);
    const result = luFileStatusStorage.get(botName);
    Object.keys(result).forEach(id => {
      expect(result[id]).toBeTruthy();
    });
  });

  it('update one luis file', () => {
    luFileStatusStorage.updateFileStatus(botName, fileIds[0]);
    const result = luFileStatusStorage.get(botName);
    expect(result[fileIds[0]]).toBeFalsy();
    expect(result[fileIds[1]]).toBeTruthy();
    expect(result[fileIds[2]]).toBeTruthy();
    expect(result[fileIds[3]]).toBeTruthy();
  });

  it('remove one luis file', () => {
    luFileStatusStorage.removeFileStatus(botName, fileIds[0]);
    const result = luFileStatusStorage.get(botName);
    expect(result[fileIds[0]]).toBeUndefined;
    expect(result[fileIds[1]]).toBeTruthy();
    expect(result[fileIds[2]]).toBeTruthy();
    expect(result[fileIds[3]]).toBeTruthy();
  });

  it('remove all statuses', () => {
    luFileStatusStorage.removeAllStatuses(botName);
    const result = luFileStatusStorage.get(botName);
    expect(result).toBeUndefined;
  });
});
