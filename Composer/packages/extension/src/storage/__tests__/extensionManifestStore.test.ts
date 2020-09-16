// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from 'fs';

import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';

import { ExtensionManifestStore } from '../extensionManifestStore';

jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  readJsonSync: jest.fn(),
  writeJsonSync: jest.fn(),
}));

const manifestPath = './__extensions__.json';

afterAll(() => {
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }
});

describe('when the manifest does not exist', () => {
  it('creates one with the default data', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    new ExtensionManifestStore(manifestPath);
    expect(writeJsonSync).toHaveBeenCalledWith(manifestPath, {}, { spaces: 2 });
  });
});

describe('when the manifest already exists', () => {
  const currentManifest = {
    extension1: {
      id: 'extension1',
    },
  };

  beforeAll(() => {
    if (fs.existsSync(manifestPath)) {
      fs.unlinkSync(manifestPath);
    }

    fs.writeFileSync(manifestPath, JSON.stringify({}));
  });

  beforeEach(() => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (readJsonSync as jest.Mock).mockImplementation((path) => {
      if (path === manifestPath) {
        return { ...currentManifest };
      }
    });
  });

  it('reads from the manifest', () => {
    new ExtensionManifestStore(manifestPath);
    expect(readJsonSync).toHaveBeenCalledWith(manifestPath);
  });

  describe('#getExtensionConfig', () => {
    it('returns the extension metadata', () => {
      const store = new ExtensionManifestStore(manifestPath);

      expect(store.getExtensionConfig('extension1')).toEqual(currentManifest.extension1);
    });
  });

  describe('#getExtensions', () => {
    it('returns all extension metadata', () => {
      const store = new ExtensionManifestStore(manifestPath);

      expect(store.getExtensions()).toEqual(currentManifest);
    });
  });

  describe('#updateExtensionConfig', () => {
    it('creates a new entry if config does not exist', () => {
      const newExtension = { id: 'newExtension' };
      const store = new ExtensionManifestStore(manifestPath);
      store.updateExtensionConfig('newExtension', newExtension);

      expect(writeJsonSync).toHaveBeenCalledWith(
        manifestPath,
        { ...currentManifest, newExtension },
        expect.any(Object)
      );
    });

    it('updates the entry if config exist', () => {
      const store = new ExtensionManifestStore(manifestPath);
      store.updateExtensionConfig('extension1', { name: 'new name' });

      expect(writeJsonSync).toHaveBeenCalledWith(
        manifestPath,
        { extension1: { id: 'extension1', name: 'new name' } },
        expect.any(Object)
      );
    });
  });

  describe('#removeExtension', () => {
    it('removes the extension from the manifest', () => {
      const store = new ExtensionManifestStore(manifestPath);
      store.removeExtension('extension1');

      expect(writeJsonSync).toHaveBeenCalledWith(manifestPath, {}, expect.any(Object));
      expect(store.getExtensionConfig('extension1')).toBeUndefined();
      expect(store.getExtensions()).toEqual({});
    });
  });
});
