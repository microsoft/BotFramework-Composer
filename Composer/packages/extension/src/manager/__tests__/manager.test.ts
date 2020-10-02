// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import { readJson, ensureDir, remove } from 'fs-extra';
import glob from 'globby';

import { search, downloadPackage } from '../../utils/npm';
import { ExtensionManifestStore, ExtensionManifest } from '../../storage/extensionManifestStore';
import { ExtensionManagerImp } from '../manager';

const mockManifest = ({
  extension1: {
    id: 'extension1',
    builtIn: true,
    enabled: true,
    bundles: [
      {
        id: 'bundleId',
        path: '/some/path',
      },
    ],
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
  remove: jest.fn(),
}));

jest.mock('../../utils/npm');

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
        bundles: [
          {
            id: 'bundleId',
            path: '/some/path',
          },
        ],
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
    expect(manager.find('extension1')).toEqual({
      id: 'extension1',
      builtIn: true,
      enabled: true,
      bundles: [
        {
          id: 'bundleId',
          path: '/some/path',
        },
      ],
    });
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

describe('#installRemote', () => {
  it('ensures remote dir exists', async () => {
    manager = new ExtensionManagerImp(manifest);
    await manager.installRemote('extension1');

    expect(ensureDir).toHaveBeenLastCalledWith(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });

  it('validates destination directory', () => {
    manager = new ExtensionManagerImp(manifest);
    expect(manager.installRemote('../extension')).rejects.toThrow();
    expect(manager.installRemote('../../extension')).rejects.toThrow();
  });

  it('downloads package and updates the manifest', async () => {
    (readJson as jest.Mock).mockResolvedValue({
      name: 'extension1',
    });

    manager = new ExtensionManagerImp(manifest);
    await manager.installRemote('extension1');

    expect(downloadPackage).toHaveBeenCalledWith(
      'extension1',
      'latest',
      path.join(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR as string, 'extension1')
    );

    expect(manifest.updateExtensionConfig).toHaveBeenCalledWith(
      'extension1',
      expect.objectContaining({ id: 'extension1' })
    );
  });

  it('throws an error if problem downloading', () => {
    (downloadPackage as jest.Mock).mockRejectedValue(undefined);
    manager = new ExtensionManagerImp(manifest);

    expect(manager.installRemote('extension1', '2.0.0')).rejects.toThrow(/Unable to install/);
  });
});

// describe('#load', () => {});

describe('#enable', () => {
  it('updates the manifest and reloads the extension', async () => {
    manager = new ExtensionManagerImp(manifest);
    const loadSpy = jest.spyOn(manager, 'load');
    (loadSpy as jest.Mock).mockResolvedValue(undefined);

    await manager.enable('extension1');

    expect(manifest.updateExtensionConfig).toHaveBeenCalledWith('extension1', { enabled: true });
    expect(loadSpy).toHaveBeenCalledWith('extension1');
  });
});

describe('#disable', () => {
  it('updates the manifest', async () => {
    manager = new ExtensionManagerImp(manifest);

    await manager.disable('extension1');

    expect(manifest.updateExtensionConfig).toHaveBeenCalledWith('extension1', { enabled: false });
  });
});

describe('#remove', () => {
  it('throws an error if extension not found', () => {
    (manifest.getExtensionConfig as jest.Mock).mockReturnValue(undefined);
    manager = new ExtensionManagerImp(manifest);

    expect(manager.remove('extension1')).rejects.toThrow(/Unable to remove extension/);
  });

  it('is a no-op if the extension is builtin', async () => {
    (manifest.getExtensionConfig as jest.Mock).mockReturnValue({ builtIn: true });
    manager = new ExtensionManagerImp(manifest);

    await manager.remove('extension1');

    expect(remove).not.toHaveBeenCalled();
    expect(manifest.removeExtension).not.toHaveBeenCalled();
  });

  it('removes the extension from the manifest and cleans up', async () => {
    (manifest.getExtensionConfig as jest.Mock).mockReturnValue({ builtIn: false, path: '/some/path' });
    manager = new ExtensionManagerImp(manifest);

    await manager.remove('extension1');

    expect(remove).toHaveBeenCalledWith('/some/path');
    expect(manifest.removeExtension).toHaveBeenCalledWith('extension1');
  });
});

describe('#search', () => {
  beforeEach(() => {
    (search as jest.Mock).mockResolvedValue([
      {
        id: 'extension1',
        keywords: ['botframework-composer', 'extension', 'foo', 'bar'],
        description: 'LOREM ipsum',
        version: '1.0.0',
        url: 'extension1 npm link',
      },
      {
        id: 'extension-2',
        keywords: ['botframework-composer', 'extension', 'bar'],
        description: 'foo',
        version: '1.0.0',
        url: 'extension-2 npm link',
      },
      {
        id: 'foo',
        keywords: ['botframework-composer'],
        description: 'lorem ipsum',
        version: '1.0.0',
        url: 'foo npm link',
      },
      {
        id: 'bar',
        keywords: ['botframework-composer'],
        description: '',
        version: '1.0.0',
        url: 'bar npm link',
      },
    ]);
  });

  it('filters the search results by the extension keyword', async () => {
    manager = new ExtensionManagerImp(manifest);

    const results = await manager.search('foo');

    expect(search).toHaveBeenCalledWith('foo');
    expect(results).toHaveLength(2);
  });

  it('omits currently installed extensions', async () => {
    (manifest.getExtensionConfig as jest.Mock).mockImplementation((id) => {
      return mockManifest[id];
    });

    manager = new ExtensionManagerImp(manifest);

    const results = await manager.search('foo');

    expect(search).toHaveBeenCalledWith('foo');
    expect(results).toHaveLength(1);
  });
});

describe('#getBundle', () => {
  beforeEach(() => {
    (manifest.getExtensionConfig as jest.Mock).mockImplementation((id) => {
      return mockManifest[id];
    });
  });

  it('throws an error if extension not found', () => {
    manager = new ExtensionManagerImp(manifest);
    expect(() => manager.getBundle('does-not-exist', 'bundleId')).toThrow('extension not found');
  });

  it('throws an error if bundle not found', () => {
    manager = new ExtensionManagerImp(manifest);
    expect(() => manager.getBundle('extension1', 'does-not-exist')).toThrow('bundle not found');
  });

  it('returns the bundle path', () => {
    manager = new ExtensionManagerImp(manifest);
    expect(manager.getBundle('extension1', 'bundleId')).toEqual('/some/path');
  });
});
