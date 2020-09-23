// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';
import { ExtensionContext } from '@bfc/extension';

import { Path } from '../../../utility/path';
import { AssetManager } from '../assetManager';
jest.mock('azure-storage', () => {
  return {};
});

jest.mock('@bfc/extension', () => {
  //const p = require('path');
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
});
