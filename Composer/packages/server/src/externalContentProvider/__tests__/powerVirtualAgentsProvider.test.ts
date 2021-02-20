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

const mockGetAccessToken = jest.fn().mockResolvedValue('accessToken');
jest.mock('../../services/auth/auth', () => ({
  authService: {
    getAccessToken: async (...args) => await mockGetAccessToken(...args),
  },
}));

const mockFetch = jest.fn();
jest.mock('node-fetch', () => async (...args) => await mockFetch(...args));

describe('Power Virtual Agents provider', () => {
  const PVA_TEST_APP_ID = 'a522f059-bb65-47c0-8934-7db6e5286414';
  const PVA_PROD_APP_ID = '96ff4394-9197-43aa-b393-6a41652e21f8';
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
    mockGetAccessToken.mockClear();
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

  it('should authenticate with credentials for the INT environment', async () => {
    const accessToken = await provider.authenticate();

    const args = mockGetAccessToken.mock.calls[0];
    const credentials = args[0];
    expect(credentials.targetResource).toBe(PVA_TEST_APP_ID);
    expect(accessToken).toBe('accessToken');
  });

  it('should authenticate with credentials for the PPE environment', async () => {
    provider = new PowerVirtualAgentsProvider({
      ...metadata,
      baseUrl: 'https://bots.ppe.customercareintelligence.net/',
    });
    const accessToken = await provider.authenticate();

    const args = mockGetAccessToken.mock.calls[0];
    const credentials = args[0];
    expect(credentials.targetResource).toBe(PVA_TEST_APP_ID);
    expect(accessToken).toBe('accessToken');
  });

  it('should authenticate with credentials for the PROD environment', async () => {
    provider = new PowerVirtualAgentsProvider({ ...metadata, baseUrl: 'https://powerva.microsoft.com/' });
    const accessToken = await provider.authenticate();

    const args = mockGetAccessToken.mock.calls[0];
    const credentials = args[0];
    expect(credentials.targetResource).toBe(PVA_PROD_APP_ID);
    expect(accessToken).toBe('accessToken');
  });

  it('should authenticate with credentials for the SDF environment', async () => {
    provider = new PowerVirtualAgentsProvider({
      ...metadata,
      baseUrl: 'https://bots.sdf.customercareintelligence.net/',
    });
    const accessToken = await provider.authenticate();

    const args = mockGetAccessToken.mock.calls[0];
    const credentials = args[0];
    expect(credentials.targetResource).toBe(PVA_PROD_APP_ID);
    expect(accessToken).toBe('accessToken');
  });
});
