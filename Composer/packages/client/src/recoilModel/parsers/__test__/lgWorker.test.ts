// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgFile } from '@bfc/shared';

import lgWorker from '../lgWorker';

jest.mock('./../workers/lgParser.worker.ts', () => {
  class Test {
    onmessage = (data) => data;

    postMessage = (data) => {
      const payload = require('../workers/lgParser.worker').handleMessage(data);
      this.onmessage({ data: { id: data.id, payload } });
    };
  }

  return Test;
});

const lgFiles = [
  {
    id: 'common.en-us',
    content: `\r\n# Hello\r\n-hi`,
  },
] as LgFile[];

describe('test lg worker', () => {
  it('get expected parse result', async () => {
    const result: any = await lgWorker.parse('common.en-us', `\r\n# Hello\r\n-hi`, lgFiles);
    const expected = [{ body: '-hi', name: 'Hello', parameters: [], range: { endLineNumber: 3, startLineNumber: 2 } }];
    expect(result.templates).toMatchObject(expected);
  });
});
