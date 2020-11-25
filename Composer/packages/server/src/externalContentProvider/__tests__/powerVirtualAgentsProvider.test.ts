// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join } from 'path';

import { PowerVirtualAgentsProvider } from '../powerVirtualAgentsProvider';

jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    once: (ev, cb) => {
      if (ev === 'finish') {
        cb();
      }
    },
  }),
}));

const mockRemove = jest.fn().mockResolvedValue(undefined);
jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  remove: async (...args) => await mockRemove(...args),
}));

jest.mock('../../services/auth/auth', () => ({
  authService: {
    getAccessToken: jest.fn().mockResolvedValue('accessToken'),
  },
}));

const mockFetch = jest.fn();
jest.mock('node-fetch', () => async (...args) => await mockFetch(...args));

describe('Power Virtual Agents provider', () => {
  const envBackup = { ...process.env };
  const metadata = {
    baseUrl: 'https://bots.int.customercareintelligence.net/',
    botId: 'myBot',
    dialogId: 'myDialog',
    envId: 'myEnv',
    name: 'my-bot',
    tenantId: 'myTenant',
  };
  let provider;

  beforeEach(() => {
    provider = new PowerVirtualAgentsProvider(metadata);
    mockFetch.mockClear();
  });

  beforeAll(() => {
    Object.assign(process.env, { COMPOSER_TEMP_DIR: 'composer/temp/' });
  });

  afterAll(() => {
    Object.assign(process.env, envBackup);
  });

  it('should download the bot content', async () => {
    const mockResult = {
      body: {
        pipe: jest.fn(),
      },
      headers: {
        get: (header) => {
          if (header === 'content-type') {
            return 'application/zip';
          }
          if (header === 'etag') {
            return 'W/"Version"';
          }
        },
      },
    };
    mockFetch.mockResolvedValueOnce(mockResult);
    const result = await provider.downloadBotContent();

    expect(result.eTag).toBe('W/"Version"');
    expect((result.zipPath as string).includes('bot-assets-'));
    expect(Buffer.from(result.urlSuffix, 'base64').toString()).toBe('dialogs/myDialog');
  });

  it('should throw if the zip response does not have the correct header', async () => {
    const mockResult = {
      body: undefined,
      headers: {
        get: (header) => {
          if (header === 'content-type') {
            return 'plain/text';
          }
          if (header === 'etag') {
            return 'W/"Version"';
          }
        },
      },
      json: jest.fn().mockResolvedValue('No .zip found for bot'),
    };
    mockFetch.mockResolvedValueOnce(mockResult);
    expect(async () => await provider.downloadBotContent()).rejects.toThrowError(
      new Error(
        'Error while trying to download the bot content: Did not receive zip back from PVA: No .zip found for bot'
      )
    );
  });

  it('should throw if the zip response does not have a body', async () => {
    const mockResult = {
      body: undefined,
      headers: {
        get: (header) => {
          if (header === 'content-type') {
            return 'application/zip';
          }
          if (header === 'etag') {
            return 'W/"Version"';
          }
        },
      },
    };
    mockFetch.mockResolvedValueOnce(mockResult);
    expect(async () => await provider.downloadBotContent()).rejects.toThrowError(
      new Error('Error while trying to download the bot content: Response containing zip does not have a body')
    );
  });

  it('should throw if something goes wrong while trying to download the bot content', async () => {
    const error = new Error('Failed to download the .zip');
    mockFetch.mockRejectedValueOnce(error);

    expect(async () => await provider.downloadBotContent()).rejects.toThrowError(
      new Error(`Error while trying to download the bot content: ${error.message}`)
    );
  });

  it('should clean up', async () => {
    await provider.cleanUp();

    expect(mockRemove).toHaveBeenCalledWith(join(process.env.COMPOSER_TEMP_DIR as string, 'pva-assets'));
  });

  it('should generate an alias', async () => {
    const alias = await provider.getAlias();

    expect(alias).toBe('myEnv.myBot');
  });

  it('should authenticate', async () => {
    const accessToken = await provider.authenticate();

    expect(accessToken).toBe('accessToken');
  });
});
