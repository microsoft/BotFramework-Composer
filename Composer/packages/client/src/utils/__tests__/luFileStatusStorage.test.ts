// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import luFileStatusStorage from '../luFileStatusStorage';

const fileIds = ['1', '2', '3', '4'];
const projectId = '11111.11111111';

afterAll(() => luFileStatusStorage.removeAllStatuses(projectId));

describe('luFileStatusStorage', () => {
  it('check file status', () => {
    luFileStatusStorage.checkFileStatus(projectId, fileIds);
    expect(Object.keys(luFileStatusStorage.get(projectId)).length).toEqual(4);
  });

  it('the statuses after publishing', () => {
    luFileStatusStorage.publishAll(projectId);
    const result = luFileStatusStorage.get(projectId);
    Object.keys(result).forEach((id) => {
      expect(result[id]).toBeTruthy();
    });
  });

  it('update one luis file', () => {
    luFileStatusStorage.updateFileStatus(projectId, fileIds[0]);
    const result = luFileStatusStorage.get(projectId);
    expect(result[fileIds[0]]).toBeFalsy();
    expect(result[fileIds[1]]).toBeTruthy();
    expect(result[fileIds[2]]).toBeTruthy();
    expect(result[fileIds[3]]).toBeTruthy();
  });

  it('remove one luis file', () => {
    luFileStatusStorage.removeFileStatus(projectId, fileIds[0]);
    const result = luFileStatusStorage.get(projectId);
    expect(result[fileIds[0]]).toBeUndefined;
    expect(result[fileIds[1]]).toBeTruthy();
    expect(result[fileIds[2]]).toBeTruthy();
    expect(result[fileIds[3]]).toBeTruthy();
  });

  it('remove all statuses', () => {
    luFileStatusStorage.removeAllStatuses(projectId);
    const result = luFileStatusStorage.get(projectId);
    expect(result).toBeUndefined;
  });
});
