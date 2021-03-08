// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import qnaWorker from '../qnaWorker';

jest.mock('./../workers/qnaParser.worker.ts', () => {
  class Test {
    onmessage = (data) => data;

    postMessage = (data) => {
      const payload = require('../workers/qnaParser.worker').handleMessage(data);
      this.onmessage({ data: { id: data.id, payload } });
    };
  }

  return Test;
});

describe('test qna worker', () => {
  it('get expected parse result', async () => {
    const content = `# ? Hi
    ${'```'}
    Hello
    ${'```'}`;
    const result: any = await qnaWorker.parse('', content);
    expect(result.qnaSections.length).toBe(1);
    expect(result.isContentUnparsed).toBe(false);
  });

  it('get expected parse result', async () => {
    const content = `# ? Hi
    ${'```'}
    Hello
    ${'```'}`;
    const content1 = `# ? How
    ${'```'}
    No
    ${'```'}`;
    const result: any = await qnaWorker.parseAll([
      {
        id: '1',
        content,
      },
      {
        id: '2',
        content: content1,
      },
    ]);
    expect(result[0].qnaSections.length).toBe(1);
  });
});
