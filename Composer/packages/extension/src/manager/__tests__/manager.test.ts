// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { writeJsonSync, esnureDir } from 'fs-extra';

import { ExtensionManifestStore, ExtensionManifest } from '../../storage/extensionManifestStore';
import { ExtensionManagerImp } from '../manager';

const mockManifest = ({
  extension1: {
    id: 'extension1',
    builtIn: true,
    enabled: true,
  },
  extension2: {
    id: 'extension2',
    enabled: true,
  },
  extension3: {
    id: 'extension3',
    enabled: false,
  },
} as unknown) as ExtensionManifest;

jest.mock('../../storage/extensionManifestStore');

// jest.mock('fs-extra', () => {

// });

let manager: ExtensionManagerImp;
let manifest: ExtensionManifestStore;

beforeEach(() => {
  manifest = new ExtensionManifestStore('/some/path');
});

describe('#getAll', () => {
  it('return an array of all extensions', () => {
    (manifest.getExtensions as jest.Mock).mockReturnValue(mockManifest);
    manager = new ExtensionManagerImp(manifest);
    expect(manager.getAll()).toEqual([
      {
        id: 'extension1',
        builtIn: true,
        enabled: true,
      },
      {
        id: 'extension2',
        enabled: true,
      },
      {
        id: 'extension3',
        enabled: false,
      },
    ]);
  });
});

describe('#find', () => {
  it('returns extension metadata for id', () => {
    (manifest.getExtensionConfig as jest.Mock).mockImplementation((id) => {
      return mockManifest[id];
    });
    manager = new ExtensionManagerImp(manifest);
    expect(manager.find('extension1')).toEqual({ id: 'extension1', builtIn: true, enabled: true });
    expect(manager.find('does-not-exist')).toBeUndefined();
  });
});

describe('#loadAll', () => {
  it('loads built-in extensions and remote extensions that are enabled', async () => {
    const loadSpy = jest.spyOn(manager, 'loadFromDir');

    loadSpy.mockReturnValue(Promise.resolve());

    await manager.loadAll();

    expect(loadSpy).toHaveBeenCalledTimes(2);
    expect(loadSpy).toHaveBeenNthCalledWith(1, process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR);
    expect(loadSpy).toHaveBeenNthCalledWith(2, process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });
});

// describe('#installRemote', () => {});
// describe('#loadBuiltinExtensions', () => {});
// describe('#loadRemotePlugins', () => {});
// describe('#load', () => {});
// describe('#enable', () => {});
// describe('#disable', () => {});
// describe('#remove', () => {});
// describe('#search', () => {});
// describe('#getAllBundles', () => {});
// describe('#getBundle', () => {});
