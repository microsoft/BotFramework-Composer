// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';

import { ExtensionContext } from '../../../models/extension/extensionContext';
import { Path } from '../../../utility/path';
import { AssetManager } from '../assetManager';
import StorageService from '../../../services/storage';

jest.mock('azure-storage', () => {
  return {};
});

jest.mock('../../../models/extension/extensionContext', () => {
  return {
    ExtensionContext: {
      extensions: {
        botTemplates: [],
      },
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
});
