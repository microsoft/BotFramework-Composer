// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import luWorker from '../luWorker';

jest.mock('./../workers/luParser.worker.ts', () => {
  class Test {
    onmessage = (data) => data;

    postMessage = (data) => {
      const payload = require('../workers/luParser.worker').handleMessage({ data });
      this.onmessage({ data: { id: data.id, payload } });
    };
  }

  return Test;
});

describe('test lu worker', () => {
  it('get expected parse result', async () => {
    const content = `# Hello
- hi`;
    const result: any = await luWorker.parse('', content);
    const expected = [{ Body: '- hi', Entities: [], Name: 'Hello', range: { endLineNumber: 2, startLineNumber: 1 } }];
    expect(result.intents).toMatchObject(expected);
  });

  it('should parse lu file with diagnostic', async () => {
    const content = `# Greeting
hi
- hello

@ simple friendsName

`;
    const { intents, diagnostics }: any = await luWorker.parse('', content);
    expect(intents.length).toEqual(1);
    expect(diagnostics.length).toEqual(1);
    expect(diagnostics[0].range.start.line).toEqual(2);
    expect(diagnostics[0].range.start.character).toEqual(0);
    expect(diagnostics[0].range.end.line).toEqual(2);
    expect(diagnostics[0].range.end.character).toEqual(2);
  });
});
