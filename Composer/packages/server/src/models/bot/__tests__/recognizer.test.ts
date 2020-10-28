// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKKinds } from '@bfc/shared';

import {
  getCrossTrainedRecognizerDialog,
  getLuFileLocale,
  getLuisRecognizerDialogs,
  getMultiLanguagueRecognizerDialog,
  getQnaMakerRecognizerDialogs,
  updateRecognizers,
} from '../recognizer';

describe('Test the generated recognizer dialogs', () => {
  it('should get luis file locale', () => {
    expect(getLuFileLocale('a.en-us.lu')).toBe('en-us');
    expect(getLuFileLocale('a.en-us.qna')).toBe('en-us');
  });

  it('should get MultiLanguagueRecognizer', () => {
    const result = getMultiLanguagueRecognizerDialog('test', ['test.en-us.qna', 'test.fr-fr.qna'], 'qna');
    expect(result.name).toBe('test.qna.dialog');
    expect(JSON.parse(result.content).recognizers['en-us']).toBe('test.en-us.qna');
    expect(JSON.parse(result.content).recognizers['']).toBe('test.en-us.qna');
    expect(JSON.parse(result.content).recognizers['fr-fr']).toBe('test.fr-fr.qna');
  });

  it('should get CrossTrainedRecognizerDialog', () => {
    const result = getCrossTrainedRecognizerDialog('test', ['test.en-us.qna', 'test.en-us.lu']);
    expect(result.name).toBe('test.lu.qna.dialog');
    expect(JSON.parse(result.content).recognizers[0]).toBe('test.qna');
    expect(JSON.parse(result.content).recognizers[1]).toBe('test.lu');
  });

  it('should get LuisRecognizerDialogs', () => {
    const result = getLuisRecognizerDialogs('test', ['test.en-us.lu', 'test.fr-fr.lu']);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('test.en-us.lu.dialog');
    expect(JSON.parse(result[1].content)).toStrictEqual({
      $kind: SDKKinds.LuisRecognizer,
      id: `LUIS_test`,
      applicationId: `=settings.luis.test_fr_fr_lu.appId`,
      version: `=settings.luis.test_fr_fr_lu.version`,
      endpoint: '=settings.luis.endpoint',
      endpointKey: '=settings.luis.endpointKey',
    });
  });

  it('should get QnaMakerRecognizer', () => {
    const result = getQnaMakerRecognizerDialogs('test', ['test.en-us.qna', 'test.fr-fr.qna']);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('test.en-us.qna.dialog');
    expect(JSON.parse(result[1].content)).toStrictEqual({
      $kind: SDKKinds.QnAMakerRecognizer,
      id: `QnA_test`,
      knowledgeBaseId: `=settings.qna.test_fr_fr_qna`,
      hostname: '=settings.qna.hostname',
      endpointKey: '=settings.qna.endpointKey',
    });
  });

  it('should update recognizer', async () => {
    const globMock = jest.fn(() => []);
    const writeFileMock = jest.fn();
    await updateRecognizers(true)(
      'test',
      ['test.en-us.qna', 'test.fr-fr.qna', 'test.en-us.lu', 'test.fr-fr.lu'],
      { glob: globMock, writeFile: writeFileMock } as any,
      { defalutLanguage: 'en-us', folderPath: '' }
    );
    expect(globMock).toBeCalledWith('test.*', '');
    expect(writeFileMock).toBeCalledTimes(7);
  });
});
