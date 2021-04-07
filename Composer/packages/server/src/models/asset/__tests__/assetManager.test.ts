// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';
import { enableFetchMocks } from 'jest-fetch-mock';
import { BotTemplate } from '@bfc/shared';

import { ExtensionContext } from '../../../models/extension/extensionContext';
import { Path } from '../../../utility/path';
import { AssetManager } from '../assetManager';
import StorageService from '../../../services/storage';

jest.mock('azure-storage', () => {
  return {};
});

jest.mock('fs-extra', () => {
  return {
    mkdirSync: jest.fn(),
  };
});

jest.mock('@bfc/extension', () => {
  return {
    ExtensionContext: {
      extensions: {
        botTemplates: [],
      },
    },
  };
});

jest.mock('@bfc/server-workers', () => {
  return {
    ServerWorker: {
      execute: jest.fn(),
    },
  };
});

const mockSampleBotPath = Path.join(__dirname, '../../../__mocks__/asset/projects/SampleBot');
const mockCopyToPath = Path.join(__dirname, '../../../__mocks__/new');
const locationRef = {
  storageId: 'default',
  path: mockCopyToPath,
};

beforeAll(() => {
  ExtensionContext.extensions.botTemplates.push({
    id: 'SampleBot',
    name: 'Sample Bot',
    description: 'Sample Bot',
    path: mockSampleBotPath,
  });
});

describe('assetManager', () => {
  it('getProjectTemplate', async () => {
    const assetManager = new AssetManager();
    const result = await assetManager.getProjectTemplates();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Sample Bot');
    expect(result[0].id).toBe('SampleBot');
  });

  it('copyProjectTemplateTo', async () => {
    const assetManager = new AssetManager();
    await assetManager.getProjectTemplates();

    await expect(assetManager.copyProjectTemplateTo('SampleBot', locationRef)).resolves.toBe(locationRef);
    // remove the saveas files
    try {
      rimraf.sync(mockCopyToPath);
    } catch (error) {
      throw new Error(error);
    }
  });

  describe('copyRemoteProjectTemplateTo', () => {
    const getStorageClientBackup = StorageService.getStorageClient;

    afterAll(() => {
      StorageService.getStorageClient = getStorageClientBackup;
    });

    it('should copy a template directory to a location', async () => {
      const assetManager = new AssetManager();
      (assetManager as any).copyTemplateDirTo = jest.fn().mockResolvedValue(undefined);
      StorageService.getStorageClient = jest.fn().mockReturnValue({
        exists: jest.fn().mockResolvedValue(false),
      });
      const mockLocRef = { path: '/path/to/bot', storageId: 'default' };
      const location = await assetManager.copyRemoteProjectTemplateTo('tempDir', mockLocRef, undefined, undefined);

      expect(location).toEqual(mockLocRef);
    });

    it('should throw if the destination directory already exists', async () => {
      const assetManager = new AssetManager();
      (assetManager as any).copyTemplateDirTo = jest.fn().mockResolvedValue(undefined);
      StorageService.getStorageClient = jest.fn().mockReturnValue({
        exists: jest.fn().mockResolvedValue(true),
      });
      const mockLocRef = { path: '/path/to/bot', storageId: 'default' };

      expect(
        async () => await assetManager.copyRemoteProjectTemplateTo('tempDir', mockLocRef, undefined, undefined)
      ).rejects.toThrowError(new Error('already have this folder, please give another name'));
    });
  });

  describe('getFeedContents', () => {
    const mockFeedResponse = {
      objects: [
        {
          package: {
            name: 'generator-conversational-core',
            version: '1.0.3',
            description: 'Preview conversational core package for TESTING ONLY',
            keywords: ['conversationalcore', 'yeoman-generator'],
          },
        },
      ],
    };

    enableFetchMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockFeedResponse));
    it('Get contents of a feed and return template array', async () => {
      const assetManager = new AssetManager();
      const mockFeedUrl =
        'https://registry.npmjs.org/-/v1/search?text=conversationalcore&size=100&from=0&quality=0.65&popularity=0.98&maintenance=0.5';
      const templates = await assetManager.getCustomFeedTemplates([mockFeedUrl]);
      expect(templates).toStrictEqual([
        {
          id: 'generator-conversational-core',
          name: 'Conversational Core',
          description: 'Preview conversational core package for TESTING ONLY',
          package: {
            packageName: 'generator-conversational-core',
            packageSource: 'npm',
            packageVersion: '1.0.3',
          },
        },
      ] as BotTemplate[]);
    });
  });

  describe('copyRemoteProjectTemplateToV2', () => {
    it('Should instantiate npm driven template and return new conv ref', async () => {
      const mockLocRef = { path: '/path/to/npmbot', storageId: 'default' };
      const assetManager = new AssetManager();
      const newBotLocationRef = await assetManager.copyRemoteProjectTemplateToV2(
        'generator-conversational-core',
        '1.0.3',
        'sampleConversationalCore',
        mockLocRef,
        '0',
        'webapp',
        'dotnet'
      );
      expect(newBotLocationRef).toStrictEqual({
        path: '/path/to/npmbot',
        storageId: 'default',
      });
    });
  });
});
