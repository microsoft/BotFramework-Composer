// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Range, Position, LuIntentSection } from '@bfc/shared';

import luWorker from '../luWorker';

const luFeatures = {};

jest.mock('./../workers/luParser.worker.ts', () => {
  class Test {
    onmessage = (data) => data;

    postMessage = (data) => {
      const payload = require('../workers/luParser.worker').handleMessage(data);
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

let luFile;
describe('test lu worker', () => {
  it('get expected parse result', async () => {
    const content = `# Hello
- hi`;
    const result: any = await luWorker.parse('', content, luFeatures);
    const expected = [
      { Body: '- hi', Entities: [], Name: 'Hello', range: new Range(new Position(1, 0), new Position(2, 4)) },
    ];
    expect(result.intents).toMatchObject(expected);
    luFile = result;
  });

  it('should parse lu file with diagnostic', async () => {
    const content = `# Greeting
hi
- hello

@ simple friendsName

`;
    const { intents, diagnostics }: any = await luWorker.parse('', content, luFeatures);
    expect(intents.length).toEqual(1);
    expect(diagnostics.length).toEqual(1);
    expect(diagnostics[0].range.start.line).toEqual(2);
    expect(diagnostics[0].range.start.character).toEqual(0);
    expect(diagnostics[0].range.end.line).toEqual(2);
    expect(diagnostics[0].range.end.character).toEqual(2);
  });

  it('get expected add intent result', async () => {
    const result: any = await luWorker.addIntent(luFile, getLuIntent('New', '-IntentValue'), luFeatures);
    const expected = {
      Body: '-IntentValue',
      Entities: [],
      Name: 'New',
      range: new Range(new Position(4, 0), new Position(5, 12)),
    };
    expect(result.intents.length).toBe(2);
    expect(result.intents[1]).toMatchObject(expected);
    luFile = result;
  });

  it('get expected add intents result', async () => {
    const result: any = await luWorker.addIntents(
      luFile,
      [getLuIntent('New1', '-IntentValue1'), getLuIntent('New2', '-IntentValue2')],
      luFeatures
    );
    const expected = {
      Body: '-IntentValue2',
      Entities: [],
      Name: 'New2',
      range: new Range(new Position(10, 0), new Position(11, 13)),
    };
    expect(result.intents.length).toBe(4);
    expect(result.intents[3]).toMatchObject(expected);
    luFile = result;
  });

  it('get expected update intent result', async () => {
    const result: any = await luWorker.updateIntent(luFile, 'New', getLuIntent('New', '-update'), luFeatures);
    const expected = {
      Body: '-update',
      Entities: [],
      Name: 'New',
      range: new Range(new Position(4, 0), new Position(5, 7)),
    };
    expect(result.intents.length).toBe(4);
    expect(result.intents[1]).toMatchObject(expected);
    luFile = result;
  });

  it('get expected remove intent result', async () => {
    const result: any = await luWorker.removeIntent(luFile, 'New2', luFeatures);
    expect(result.intents.length).toBe(3);
    expect(result.intents[3]).toBeUndefined();
    luFile = result;
  });

  it('get expected remove intent result', async () => {
    const result: any = await luWorker.removeIntents(luFile, ['New1', 'New'], luFeatures);
    expect(result.intents.length).toBe(1);
  });
});
