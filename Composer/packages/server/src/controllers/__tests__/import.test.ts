// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { normalize } from 'path';

import { ImportController } from '../import';

const mockGetProvider = jest.fn();
jest.mock('../../externalContentProvider/contentProviderFactory', () => ({
  contentProviderFactory: {
    getProvider: (...args) => mockGetProvider(...args),
  },
}));

jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
}));

jest.mock('extract-zip', () => jest.fn().mockResolvedValue(undefined));

describe('Import controller', () => {
  const mockRes: any = {
    json: jest.fn(),
    sendStatus: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  const envBackup = { ...process.env };

  beforeAll(() => {
    Object.assign(process.env, { COMPOSER_TEMP_DIR: 'composer/temp/' });
  });

  beforeEach(() => {
    mockGetProvider.mockClear();
    mockRes.json.mockClear();
    mockRes.sendStatus.mockClear();
    mockRes.status.mockClear();
  });

  afterAll(() => {
    Object.assign(process.env, envBackup);
  });

  it('should authenticate with the external content provider', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    const mockProvider = {
      authenticate: jest.fn().mockReturnValue('accessToken'),
    };
    mockGetProvider.mockReturnValueOnce(mockProvider);
    await ImportController.authenticate(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ accessToken: 'accessToken' });
  });

  it('should return a 200 and do nothing if the content provider does not require auth', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    const mockProvider = {};
    mockGetProvider.mockReturnValueOnce(mockProvider);
    await ImportController.authenticate(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should return a 400 if no content provider exists for the given source', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someUnsupportedService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    mockGetProvider.mockReturnValueOnce(undefined);
    await ImportController.authenticate(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No content provider found for source: someUnsupportedService',
    });
  });

  it('should start the import process and return a 200', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    const botContentResponse = { eTag: 'W/"Version"', urlSuffix: 'dialogs/myDialog', zipPath: '/path/to/bot/zip.zip' };
    const mockProvider = {
      cleanUp: jest.fn().mockResolvedValue(undefined),
      downloadBotContent: jest.fn().mockResolvedValue(botContentResponse),
      getAlias: jest.fn().mockResolvedValue('someAlias'),
    };
    mockGetProvider.mockReturnValueOnce(mockProvider);
    await ImportController.startImport(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const returnedJson = mockRes.json.mock.calls[0][0];
    expect(returnedJson.alias).toBe('someAlias');
    expect(returnedJson.eTag).toBe(botContentResponse.eTag);
    expect(returnedJson.urlSuffix).toBe(botContentResponse.urlSuffix);
    expect((returnedJson.templateDir as string).startsWith(normalize(process.env.COMPOSER_TEMP_DIR as string)));
  });

  it('should return a 400 if no content provider exists for the given source', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someUnsupportedService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    mockGetProvider.mockReturnValueOnce(undefined);
    await ImportController.startImport(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No content provider found for source: someUnsupportedService',
    });
  });

  it('should return a 500 something goes wrong while trying to import', async () => {
    const mockPayload = { data: 'some meta data' };
    const mockReq: any = {
      params: {
        source: 'someUnsupportedService',
      },
      query: {
        payload: JSON.stringify(mockPayload),
      },
    };
    const err = new Error('There was a problem downloading the bot .zip');
    const mockProvider = {
      downloadBotContent: jest.fn().mockRejectedValue(err),
    };
    mockGetProvider.mockReturnValueOnce(mockProvider);
    await ImportController.startImport(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    const returnedJson = mockRes.json.mock.calls[0][0];
    expect((returnedJson.message as string).includes(err.message));
  });
});
