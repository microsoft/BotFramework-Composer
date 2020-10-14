// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/types';
import { Utility } from '@microsoft/bf-orchestrator';
import rimraf from 'rimraf';

import * as path from 'path';
import { IFileStorage } from '../../storage/interface';
import { Builder } from '../builder';
import mockLUInput from '../__mocks__/mockLUInput.json';

const nlrId: string = 'pretrained.20200924.microsoft.dte.00.03.en.onnx';
const nlrPath: string = path.resolve('./orchestrator_ut_model/');
const downloadModelTimeoutMs = 90000;

describe('Orchestrator Tests', () => {
  beforeAll(async () => {
    Utility.toPrintDebuggingLogToConsole = false;
  });

  beforeAll(async () => {
    // disable Orchestrator Lib console logging across the board - interferes with Jest
    Utility.toPrintDebuggingLogToConsole = false;

    const progressStatusStub = jest.fn();
    const successStatusStub = jest.fn();

    let builder = new Builder('', {} as IFileStorage, 'en-us');
    // download the UT NLR model once before all tests are run - build tests don't work without this
    await builder.runOrchestratorNlrGet(nlrPath, nlrId, progressStatusStub, successStatusStub);

    expect(progressStatusStub).toBeCalled();
    expect(successStatusStub).toBeCalledTimes(1);
  }, downloadModelTimeoutMs);

  afterAll(async () => {
    const callbackStub = jest.fn();
    rimraf(nlrPath, callbackStub);

    expect(callbackStub).toBeCalledWith();
  });

  it('always lists DTE 3L model for FTs', async () => {
    let builder = new Builder('', {} as IFileStorage, 'en-us');

    const nlrList = await builder.runOrchestratorNlrList();
    expect(Object.getOwnPropertyNames(nlrList.models)).toContain(nlrId);
  });

  it('throws if input empty', () => {
    let builder = new Builder('', {} as IFileStorage, 'en-us');

    expect(builder.runOrchestratorBuild([], nlrPath)).rejects.toThrow();
  });

  it('throws if NLR path invalid', () => {
    let builder = new Builder('', {} as IFileStorage, 'en-us');

    const data: FileInfo[] = [{ name: 'hello', content: 'test', lastModified: '', path: '', relativePath: '' }];
    expect(builder.runOrchestratorBuild(data, 'invalidPath')).rejects.toThrow();
  });

  it('produces expected snapshot and recognizer shape', async () => {
    let builder = new Builder('', {} as IFileStorage, 'en-us');

    let buildOutput = await builder.runOrchestratorBuild(mockLUInput, nlrPath);

    expect(buildOutput.outputs.map((o) => o.id)).toContain('additem.en-us.lu');

    let addItemData = buildOutput.outputs.find((o) => o.id == 'additem.en-us.lu');
    expect(addItemData?.snapshot).toBeTruthy();
  });

  it('produces expected recognizer shape', async () => {
    let builder = new Builder('', {} as IFileStorage, 'en-us');
    let buildOutput = await builder.runOrchestratorBuild(mockLUInput, nlrPath);

    expect(buildOutput.outputs.map((o) => o.id)).toContain('additem.en-us.lu');

    let addItemData = buildOutput.outputs.find((o) => o.id == 'additem.en-us.lu');
    expect(addItemData?.recognizer).toBeTruthy();

    expect(addItemData?.recognizer.orchestratorRecognizer).toBeTruthy();
    expect(addItemData?.recognizer.orchestratorRecognizer.$kind).toBe('Microsoft.OrchestratorRecognizer');
  });
});
