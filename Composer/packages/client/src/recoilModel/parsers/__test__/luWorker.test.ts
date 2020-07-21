// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection } from '@bfc/shared';

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

const getLuIntent = (Name, Body): LuIntentSection =>
  ({
    Name,
    Body,
  } as LuIntentSection);

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

  it('should add an intent', async () => {
    const content = `# Greeting
	hi
	- hello

	@ simple friendsName

	`;
    const result: any = await luWorker.addIntent(content, getLuIntent('Hello', '-IntentValue'));
    expect(result).toContain('-IntentValue');
  });

  it('should remove an intent', async () => {
    const content = `# Greeting
	hi
	- hello

	@ simple friendsName

	`;
    const result: any = await luWorker.removeIntent(content, 'Greeting');
    expect(result).not.toContain('- hello');
  });

  it('should update an intent', async () => {
    const content = `# Greeting
	hi
	- hello

	@ simple friendsName

	`;
    const result: any = await luWorker.updateIntent(content, 'Greeting', getLuIntent('Greeting', '-IntentValue'));
    expect(result).not.toContain('- hello');
    expect(result).toContain('-IntentValue');
  });
});
