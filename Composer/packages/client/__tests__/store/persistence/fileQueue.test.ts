// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import FileQueue from './../../../src/store/persistence/FileQueue';
import { FileChangeType } from './../../../src/store/persistence/types';

const queue = new FileQueue();
describe('test the queue behavior in persistence', () => {
  it('push the file to queue', async () => {
    queue.push([{ name: '1', content: '' }], FileChangeType.CREATE);
    queue.push([{ name: '2', content: '' }], FileChangeType.CREATE);
    queue.push([{ name: '3', content: '' }], FileChangeType.DELETE);
    expect(queue.tasks.length).toBe(3);
    expect(queue.tasks[0].file.name).toBe('1');
    expect(queue.tasks[1].file.name).toBe('2');
    expect(queue.tasks[2].file.name).toBe('3');
  });

  it('merge the same file change', async () => {
    queue.push([{ name: '1', content: '1' }], FileChangeType.UPDATE);
    queue.push([{ name: '2', content: '2' }], FileChangeType.UPDATE);
    queue.push([{ name: '4', content: '' }], FileChangeType.UPDATE);
    expect(queue.tasks.length).toBe(4);
    expect(queue.tasks[0].file.name).toBe('1');
    expect(queue.tasks[0].file.content).toBe('1');
    expect(queue.tasks[1].file.name).toBe('2');
    expect(queue.tasks[1].file.content).toBe('2');
    expect(queue.tasks[2].file.name).toBe('3');
    expect(queue.tasks[3].file.name).toBe('4');
  });

  it('pop all task', async () => {
    const result = queue.popList();
    expect(result.length).toBe(4);
    expect(queue.tasks.length).toBe(0);
  });
});
