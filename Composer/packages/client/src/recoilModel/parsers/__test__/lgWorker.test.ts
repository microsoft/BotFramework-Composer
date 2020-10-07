// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgFile, Range, Position, LgTemplate } from '@bfc/shared';

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

const lgCache = require('../workers/lgParser.worker').cache;

const lgFiles = [
  {
    id: 'common.en-us',
    content: `\r\n# Hello\r\n-hi`,
  },
] as LgFile[];

const getLgTemplate = (name, body): LgTemplate =>
  ({
    name,
    body,
  } as LgTemplate);

describe('test lg worker', () => {
  it('cache the new project', async () => {
    await lgWorker.addProject('test', lgFiles);
    expect(lgCache.projects.has('test')).toBeTruthy();
  });

  it('get expected parse result', async () => {
    const result: any = await lgWorker.parse('test', 'common.en-us', `\r\n# Hello\r\n-hi`, lgFiles);
    const expected = [
      { body: '-hi', name: 'Hello', parameters: [], range: new Range(new Position(2, 0), new Position(3, 3)) },
    ];
    expect(result.templates).toMatchObject(expected);
  });

  it('get expected add template result', async () => {
    const result: any = await lgWorker.addTemplate('test', lgFiles[0], getLgTemplate('Test', '-add'), lgFiles);
    const expected = {
      body: '-add',
      name: 'Test',
      parameters: [],
      range: new Range(new Position(4, 0), new Position(5, 4)),
    };
    expect(result.templates[1]).toMatchObject(expected);
    lgFiles[0] = result;
  });

  it('get expected add templates result', async () => {
    const result: any = await lgWorker.addTemplates(
      'test',
      lgFiles[0],
      [getLgTemplate('Test1', '-add1'), getLgTemplate('Test2', '-add2')],
      lgFiles
    );
    const expected = {
      body: '-add2',
      name: 'Test2',
      parameters: [],
      range: new Range(new Position(8, 0), new Position(9, 5)),
    };
    expect(result.templates.length).toBe(4);
    expect(result.templates[3]).toMatchObject(expected);
    lgFiles[0] = result;
  });

  it('get expected update template result', async () => {
    const result: any = await lgWorker.updateTemplate(
      'test',
      lgFiles[0],
      'Test2',
      getLgTemplate('Test2', '-update'),
      lgFiles
    );
    const expected = {
      body: '-update',
      name: 'Test2',
      parameters: [],
      range: new Range(new Position(8, 0), new Position(9, 7)),
    };
    expect(result.templates.length).toBe(4);
    expect(result.templates[3]).toMatchObject(expected);
    lgFiles[0] = result;
  });

  it('get expected remove template result', async () => {
    const result: any = await lgWorker.removeTemplate('test', lgFiles[0], 'Test2', lgFiles);
    expect(result.templates.length).toBe(3);
    lgFiles[0] = result;
  });

  it('get expected copy template result', async () => {
    const result: any = await lgWorker.copyTemplate('test', lgFiles[0], 'Test', 'Test2', lgFiles);
    expect(result.templates.length).toBe(4);
    const expected = {
      body: '-add',
      name: 'Test2',
      parameters: [],
      range: new Range(new Position(8, 0), new Position(9, 4)),
    };
    expect(result.templates[3]).toMatchObject(expected);
    lgFiles[0] = result;
  });

  it('get expected remove templates result', async () => {
    const result: any = await lgWorker.removeTemplates('test', lgFiles[0], ['Test2', 'Test1'], lgFiles);
    expect(result.templates.length).toBe(2);
    lgFiles[0] = result;
  });

  it('clean project', async () => {
    await lgWorker.removeProject('test');
    expect(lgCache.projects.has('test')).toBeFalsy();
  });
});
