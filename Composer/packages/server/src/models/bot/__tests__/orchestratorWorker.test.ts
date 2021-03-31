// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelResolver, Utility, Orchestrator } from '@microsoft/bf-orchestrator';
import { pathExists, readdir, readJson } from 'fs-extra';

import { cache, warmUpCache } from '../process/orchestratorWorker';

jest.mock('@microsoft/bf-orchestrator');
jest.mock('fs-extra', () => ({
  pathExists: jest.fn(async (path) => path === './generatedFolder' || path.endsWith('orchestrator.settings.json')),
  readdir: jest.fn(async (path) => {
    if (path === './generatedFolder') {
      return ['test.en.lu', 'test.en.blu', 'test.zh-cn.blu', 'settings.json', '/path'];
    }
    return [];
  }),
  readJson: jest.fn(async (file) => {
    return {
      orchestrator: {
        models: {
          en: './model/en.onnx',
          multilang: './model/multilang.onnx',
        },
        snapshots: {
          testZhCn: './generated/test.zh-cn.blu',
        },
      },
    };
  }),
  readFile: jest.fn(async (file) => {
    return Buffer.from('test blu file');
  }),
}));

describe('Orchestrator Warmup Cache', () => {
  beforeAll(async () => {
    Utility.toPrintDebuggingLogToConsole = false; //disable Orchestrator logging
  });

  beforeEach(async () => {
    (Orchestrator.getLabelResolversAsync as jest.Mock).mockImplementation(
      async (intentModelPath: string, _: string, snapshots: Map<string, Uint8Array>) => {
        return new Map<string, LabelResolver>();
      }
    );

    (readdir as jest.Mock).mockClear();
    (pathExists as jest.Mock).mockClear();
    (Orchestrator.getLabelResolversAsync as jest.Mock).mockClear();

    cache.clear();
  });

  it('exits on invalid generatedFolderPath', async () => {
    expect(await warmUpCache('badpath', 'abc')).toBeFalsy();
  });

  it('exits if cache for project has contents', async () => {
    const data: [string, LabelResolver] = ['test.en.lu', {} as LabelResolver];
    cache.set('abc', new Map([data]));
    expect(cache.get('abc').size).toBe(1);

    expect(await warmUpCache('./generatedFolder', 'abc')).toBeFalsy();
  });

  it('exits if no blu files in generated folder', async () => {
    expect(cache.get('abc').size).toBe(0);

    expect(await warmUpCache('./emptyGeneratedFolder', 'abc')).toBeFalsy();
    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(0);
  });

  it('exits if Orchestrator settings is invalid', async () => {
    (Orchestrator.getLabelResolversAsync as jest.Mock).mockImplementation(
      async (intentModelPath: string, _: string, snapshots: Map<string, Uint8Array>) => {
        return new Map<string, LabelResolver>();
      }
    );
    (readJson as jest.Mock).mockImplementationOnce(async (file) => 'corrupted settings');

    await warmUpCache('./generatedFolder', 'abc');
    expect(pathExists).toHaveBeenCalledTimes(2);
    expect(readJson).toHaveBeenCalled();

    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(0);
  });

  it('exits if Orchestrator settings cannot be read', async () => {
    (readJson as jest.Mock).mockImplementationOnce(async (file) => undefined);

    expect(await warmUpCache('./generatedFolder', 'abc')).toBeFalsy();
    expect(pathExists).toHaveBeenCalledTimes(2);
    expect(readJson).toHaveBeenCalled();

    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(0);
  });

  it('sends correct data shape to Orchestrator library for en + multilang', async () => {
    expect(cache.get('abc').size).toBe(0);
    expect(await readdir('./generatedFolder')).toContain('test.en.blu');

    await warmUpCache('./generatedFolder', 'abc');

    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(2);
    expect(Orchestrator.getLabelResolversAsync).toHaveBeenNthCalledWith(
      1,
      './model/en.onnx',
      '',
      new Map([['test.en.lu', new Uint8Array(Buffer.from('test blu file'))]]),
      false
    );
    expect(Orchestrator.getLabelResolversAsync).toHaveBeenNthCalledWith(
      2,
      './model/multilang.onnx',
      '',
      new Map([['test.zh-cn.lu', new Uint8Array(Buffer.from('test blu file'))]]),
      false
    );
  });

  it('sends correct data shape to Orchestrator library for en only', async () => {
    expect(cache.get('abc').size).toBe(0);

    (readdir as jest.Mock).mockImplementationOnce(async (path: string) => ['test.en.blu', 'test.en-us.blu']);

    await warmUpCache('./generatedFolder', 'abc');

    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(1);
    expect(Orchestrator.getLabelResolversAsync).toHaveBeenNthCalledWith(
      1,
      './model/en.onnx',
      '',
      new Map([
        ['test.en-us.lu', new Uint8Array(Buffer.from('test blu file'))],
        ['test.en.lu', new Uint8Array(Buffer.from('test blu file'))],
      ]),
      false
    );
  });

  it('sends correct data shape to Orchestrator library for multilang only', async () => {
    expect(cache.get('abc').size).toBe(0);

    (readdir as jest.Mock).mockImplementationOnce(async (path: string) => ['test.zh-cn.blu', 'test.ja-jp.blu']);

    await warmUpCache('./generatedFolder', 'abc');

    expect(Orchestrator.getLabelResolversAsync).toHaveBeenCalledTimes(1);
    expect(Orchestrator.getLabelResolversAsync).toHaveBeenNthCalledWith(
      1,
      './model/multilang.onnx',
      '',
      new Map([
        ['test.zh-cn.lu', new Uint8Array(Buffer.from('test blu file'))],
        ['test.ja-jp.lu', new Uint8Array(Buffer.from('test blu file'))],
      ]),
      false
    );
  });
});
