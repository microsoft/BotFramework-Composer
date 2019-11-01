// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';

import { Path } from '../../../src/utility/path';
import { AssetManager } from '../../../src/models/asset/assetManager';
jest.mock('azure-storage', () => {
  return {};
});
const mockAssetLibraryPath = Path.join(__dirname, '../../mocks/asset');
const mockRuntimeLibraryPath = Path.join(__dirname, '../../mocks/runtimes');

const mockCopyToPath = Path.join(__dirname, '../../mocks/new');
const locationRef = {
  storageId: 'default',
  path: mockCopyToPath,
};
describe('assetManager', () => {
  it('getProjectTemplate', async () => {
    const assetManager = new AssetManager(mockAssetLibraryPath, mockRuntimeLibraryPath);
    const result = await assetManager.getProjectTemplates();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Sample Bot');
    expect(result[0].id).toBe('SampleBot');
  });

  it('copyProjectTemplateTo', async () => {
    const assetManager = new AssetManager(mockAssetLibraryPath, mockRuntimeLibraryPath);
    await assetManager.getProjectTemplates();
    await assetManager.getProjectRuntime();

    await expect(assetManager.copyProjectTemplateTo('SampleBot', locationRef)).resolves.toBe(locationRef);
    // remove the saveas files
    try {
      rimraf.sync(mockCopyToPath);
    } catch (error) {
      throw new Error(error);
    }
  });
});
