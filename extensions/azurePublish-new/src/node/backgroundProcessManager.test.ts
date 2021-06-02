// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BackgroundProcessManager } from './backgroundProcessManager';

const mockProjectId = 'projectId';
const mockProfileName = 'profileName';
let id;
describe('background process manager', () => {
  it('can save process', () => {
    id = BackgroundProcessManager.startProcess(202, mockProjectId, mockProfileName, 'message...', 'comment');
    const status = BackgroundProcessManager.getStatusByName(mockProjectId, mockProfileName);
    expect(status).not.toBeNaN();
    expect(status.status).toBe(202);
    expect(status.projectId).toBe(mockProjectId);
    expect(status.processName).toBe(mockProfileName);
    expect(status.message).toBe('message...');
    expect(status.comment).toBe('comment');
  });

  it('can update process', () => {
    BackgroundProcessManager.updateProcess(id, 500, 'error');
    const afterUpdate = BackgroundProcessManager.getStatus(id);
    expect(afterUpdate).not.toBeNaN();
    expect(afterUpdate.status).toBe(500);
    expect(afterUpdate.projectId).toBe(mockProjectId);
    expect(afterUpdate.processName).toBe(mockProfileName);
    expect(afterUpdate.message).toBe('error');
    expect(afterUpdate.comment).toBe('comment');
  });

  it('can remove process', () => {
    BackgroundProcessManager.removeProcess(id);
    const afterRemove = BackgroundProcessManager.getStatus(id);
    expect(afterRemove).toBeUndefined();
  });
});
