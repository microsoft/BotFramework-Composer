// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseWorker } from '../baseWorker';

class MockWorker {
  onmessage;

  postMessage = (data) => {
    switch (data.type) {
      case 'return': {
        this.onmessage({ data });
        break;
      }
      case 'error': {
        this.onmessage({ data: { error: 'error', ...data } });
        break;
      }
      default:
        this.onmessage({ data });
    }
  };
}

const testWorker = new BaseWorker(new MockWorker() as Worker);

describe('test base worker', () => {
  it('get expected data', async () => {
    const result: any = await testWorker.sendMsg('return', { test: '1' });
    expect(result.test).toBe('1');
  });

  it('get error from worker', async () => {
    try {
      await testWorker.sendMsg('error', { test: '1' });
    } catch (error) {
      expect(error).toBe('error');
    }
  });

  it('waiting for flush', async () => {
    await testWorker.sendMsg('return', { test: '1' });
    await testWorker.flush();
    expect(testWorker.isEmpty()).toBeTruthy();
  });
});
