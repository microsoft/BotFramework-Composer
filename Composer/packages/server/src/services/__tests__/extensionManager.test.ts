// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import fs from 'fs';

import { readJson, ensureDir, remove } from 'fs-extra';
import glob from 'globby';

import { search, downloadPackage } from '../../utility/npm';
import { ExtensionManagerImp, ExtensionManifest } from '../extensionManager';
import { JsonStore } from '../../store/store';

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
    path: '/some/path',
  },
  extension3: {
    id: 'extension3',
    enabled: false,
  },
} as unknown) as ExtensionManifest;

jest.mock('globby', () => jest.fn());

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readJson: jest.fn(),
  remove: jest.fn(),
  pathExists: jest.fn(),
}));

jest.mock('../../utility/npm');

let manager: ExtensionManagerImp;
let loadSpy: jest.SpyInstance;
let updateManifestSpy: jest.SpyInstance;

beforeEach(() => {
  manager = new ExtensionManagerImp(
    new JsonStore(process.env.COMPOSER_EXTENSION_MANIFEST as string, { ...mockManifest })
  );
  loadSpy = jest.spyOn(manager, 'load');
  updateManifestSpy = jest.spyOn(manager, 'updateManifest');

  (remove as jest.Mock).mockClear();
});

afterEach(() => {
  fs.unlinkSync(process.env.COMPOSER_EXTENSION_MANIFEST as string);
});

describe('#getAll', () => {
  it('return an array of all extensions', () => {
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
        path: '/some/path',
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
  let loadFromDirSpy: jest.SpyInstance;

  beforeEach(() => {
    loadFromDirSpy = jest.spyOn(manager, 'loadFromDir');
    loadFromDirSpy.mockReturnValue(Promise.resolve());
  });

  it('ensures remote dir is created', async () => {
    await manager.loadAll();

    expect(ensureDir).toHaveBeenCalledWith(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });

  it('loads built-in extensions and remote extensions that are enabled', async () => {
    await manager.loadAll();

    expect(loadFromDirSpy).toHaveBeenCalledTimes(2);
    expect(loadFromDirSpy).toHaveBeenNthCalledWith(1, process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR, true);
    expect(loadFromDirSpy).toHaveBeenNthCalledWith(2, process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });
});

describe('#loadFromDir', () => {
  it('finds all package.json files in dir', async () => {
    ((glob as unknown) as jest.Mock).mockReturnValue([]);

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

    loadSpy.mockResolvedValue(undefined);

    await manager.loadFromDir('/some/dir');

    expect(readJson).toHaveBeenCalledWith(['', 'some', 'dir', 'extension1', 'package.json'].join(path.sep));
    expect(readJson).toHaveBeenCalledWith(['', 'some', 'dir', 'extension2', 'package.json'].join(path.sep));

    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', expect.objectContaining({ id: 'extension1' }));
    expect(updateManifestSpy).toHaveBeenCalledWith('extension2', expect.objectContaining({ id: 'extension2' }));

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

    loadSpy.mockResolvedValue(undefined);

    await manager.loadFromDir('/some/dir');

    expect(loadSpy).not.toHaveBeenCalled();
    expect(updateManifestSpy).toHaveBeenCalledTimes(1);
    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', undefined);
  });
});

describe('#installRemote', () => {
  it('ensures remote dir exists', async () => {
    await manager.installRemote('extension1');

    expect(ensureDir).toHaveBeenLastCalledWith(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR);
  });

  it('validates destination directory', () => {
    expect(manager.installRemote('../extension')).rejects.toThrow();
    expect(manager.installRemote('../../extension')).rejects.toThrow();
  });

  it('downloads package and updates the manifest', async () => {
    (readJson as jest.Mock).mockResolvedValue({
      name: 'extension1',
    });

    await manager.installRemote('extension1');

    expect(downloadPackage).toHaveBeenCalledWith(
      'extension1',
      'latest',
      path.join(process.env.COMPOSER_REMOTE_EXTENSIONS_DIR as string, 'extension1')
    );

    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', expect.objectContaining({ id: 'extension1' }));
  });

  it('throws an error if problem downloading', () => {
    (downloadPackage as jest.Mock).mockRejectedValue(undefined);

    expect(manager.installRemote('extension1', '2.0.0')).rejects.toThrow(/Unable to install/);
  });
});

// describe('#load', () => {});

describe('#enable', () => {
  it('updates the manifest and reloads the extension', async () => {
    (loadSpy as jest.Mock).mockResolvedValue(undefined);

    await manager.enable('extension1');

    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', { enabled: true });
    expect(loadSpy).toHaveBeenCalledWith('extension1');
  });
});

describe('#disable', () => {
  it('updates the manifest', async () => {
    await manager.disable('extension1');

    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', { enabled: false });
  });
});

describe('#remove', () => {
  it('throws an error if extension not found', () => {
    expect(manager.remove('does-not-exist')).rejects.toThrow(/Unable to remove extension/);
  });

  it('disables if the extension is builtin', async () => {
    await manager.remove('extension1');

    expect(remove).not.toHaveBeenCalled();
    expect(updateManifestSpy).toHaveBeenCalledWith('extension1', { enabled: false });
  });

  it('removes the extension from the manifest and cleans up', async () => {
    await manager.remove('extension2');

    expect(remove).toHaveBeenCalledWith('/some/path');
    expect(updateManifestSpy).toHaveBeenCalledWith('extension2', undefined);
  });
});

describe('#search', () => {
  it('filters the search results by the extension keyword', async () => {
    (search as jest.Mock).mockResolvedValue([
      {
        id: 'foo',
        keywords: ['botframework-composer'],
        description: 'lorem ipsum',
        version: '1.0.0',
        url: 'foo npm link',
      },
      {
        id: 'bar',
        keywords: ['botframework-composer', 'extension'],
        description: '',
        version: '1.0.0',
        url: 'bar npm link',
      },
      {
        id: 'missing-keyword',
        keywords: ['botframework-composer'],
        description: '',
        version: '1.0.0',
        url: 'npm link',
      },
    ]);
    const results = await manager.search('foo');

    expect(search).toHaveBeenCalledWith('foo');
    expect(results).toHaveLength(1);
  });

  it('omits currently installed extensions', async () => {
    (search as jest.Mock).mockResolvedValue([
      {
        id: 'extension1',
        keywords: ['botframework-composer', 'extension', 'foo', 'bar'],
        description: 'LOREM ipsum',
        version: '1.0.0',
        url: 'extension1 npm link',
      },
      {
        id: 'extension2',
        keywords: ['botframework-composer', 'extension', 'bar'],
        description: 'foo',
        version: '1.0.0',
        url: 'extension-2 npm link',
      },
      {
        id: 'bar',
        keywords: ['botframework-composer', 'extension'],
        description: '',
        version: '1.0.0',
        url: 'bar npm link',
      },
    ]);

    const results = await manager.search('bar');

    expect(search).toHaveBeenCalledWith('bar');
    expect(results).toHaveLength(1);
  });
});

describe('#getBundle', () => {
  it('throws an error if extension not found', () => {
    expect(() => manager.getBundle('does-not-exist', 'bundleId')).toThrow('extension not found');
  });

  it('throws an error if bundle not found', () => {
    expect(() => manager.getBundle('extension1', 'does-not-exist')).toThrow('bundle not found');
  });

  it('returns the bundle path', () => {
    expect(manager.getBundle('extension1', 'bundleId')).toEqual('/some/path');
  });
});
