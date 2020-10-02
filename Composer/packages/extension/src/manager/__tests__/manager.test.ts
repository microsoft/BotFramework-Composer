// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { readJson, ensureDir } from 'fs-extra';
import glob from 'globby';

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

jest.mock('globby', () => jest.fn());

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readJson: jest.fn(),
}));

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
  let loadSpy: jest.SpyInstance;

  beforeEach(() => {
    manager = new ExtensionManagerImp(manifest);
    loadSpy = jest.spyOn(manager, 'loadFromDir');

    loadSpy.mockReturnValue(Promise.resolve());
  });

  it('ensures remote dir is created', async () => {
    await manager.loadAll();

    expect(ensureDir).toHaveBeenCalledWith(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });

  it('loads built-in extensions and remote extensions that are enabled', async () => {
    await manager.loadAll();

    expect(loadSpy).toHaveBeenCalledTimes(2);
    expect(loadSpy).toHaveBeenNthCalledWith(1, process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR, true);
    expect(loadSpy).toHaveBeenNthCalledWith(2, process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });
});

describe('#loadFromDir', () => {
  it('finds all package.json files in dir', async () => {
    ((glob as unknown) as jest.Mock).mockReturnValue([]);
    manager = new ExtensionManagerImp(manifest);

    await manager.loadFromDir('/some/dir');
    expect(glob).toHaveBeenCalledWith('*/package.json', { cwd: '/some/dir' });
  });

  it('updates the extension manifest and loads each extension found', async () => {
    ((glob as unknown) as jest.Mock).mockReturnValue(['extension1/package.json', 'extension2/package.json']);
    (readJson as jest.Mock).mockImplementation((path) => {
      if (path.includes('extension1')) {
        return {
          name: 'extension1',
        };
      } else if (path.includes('extension2')) {
        return {
          name: 'extension2',
        };
      }

      return {};
    });

    manager = new ExtensionManagerImp(manifest);
    const loadSpy = jest.spyOn(manager, 'load');
    loadSpy.mockResolvedValue(undefined);

    await manager.loadFromDir('/some/dir');

    expect(readJson).toHaveBeenCalledWith('/some/dir/extension1/package.json');
    expect(readJson).toHaveBeenCalledWith('/some/dir/extension2/package.json');

    expect(manifest.updateExtensionConfig).toHaveBeenCalledWith(
      'extension1',
      expect.objectContaining({ id: 'extension1' })
    );
    expect(manifest.updateExtensionConfig).toHaveBeenCalledWith(
      'extension2',
      expect.objectContaining({ id: 'extension2' })
    );

    expect(loadSpy).toHaveBeenCalledWith('extension1');
    expect(loadSpy).toHaveBeenCalledWith('extension2');
  });

  it('removes the extension from the manifest if not enabled', async () => {
    ((glob as unknown) as jest.Mock).mockReturnValue(['extension1/package.json']);
    (readJson as jest.Mock).mockResolvedValue({
      name: 'extension1',
      composer: {
        enabled: false,
      },
    });
    (manifest.getExtensionConfig as jest.Mock).mockReturnValueOnce('extension1');

    manager = new ExtensionManagerImp(manifest);
    const loadSpy = jest.spyOn(manager, 'load');
    loadSpy.mockResolvedValue(undefined);

    await manager.loadFromDir('/some/dir');

    expect(manifest.updateExtensionConfig).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(manifest.removeExtension).toHaveBeenCalledTimes(1);
    expect(manifest.removeExtension).toHaveBeenCalledWith('extension1');
  });
});

// describe('#installRemote', () => {});
// describe('#load', () => {});
// describe('#enable', () => {});
// describe('#disable', () => {});
// describe('#remove', () => {});
// describe('#search', () => {});
// describe('#getAllBundles', () => {});
// describe('#getBundle', () => {});
