// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';
import { pluginLoader } from '@bfc/plugin-loader';

import { Path } from '../../../src/utility/path';
import { AssetManager } from '../../../src/models/asset/assetManager';
jest.mock('azure-storage', () => {
  return {};
});

jest.mock('@bfc/plugin-loader', () => {
  //const p = require('path');
  return {
    pluginLoader: {
      extensions: {
        botTemplates: [],
      },
    },
  };
});

const mockSampleBotPath = Path.join(__dirname, '../../mocks/asset/projects/SampleBot');
const mockCopyToPath = Path.join(__dirname, '../../mocks/new');
const locationRef = {
  storageId: 'default',
  path: mockCopyToPath,
};

beforeAll(() => {
  pluginLoader.extensions.botTemplates.push({
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
});
