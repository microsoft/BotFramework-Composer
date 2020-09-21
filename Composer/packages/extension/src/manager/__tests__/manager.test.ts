// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { writeJsonSync } from 'fs-extra';

import { ExtensionManager } from '../manager';

const mockManifest = {
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
};

beforeEach(() => {
  writeJsonSync(process.env.COMPOSER_EXTENSION_DATA as string, mockManifest);
  ExtensionManager.reloadManifest();
});

describe('#getAll', () => {
  it('return an array of all extensions', () => {
    expect(ExtensionManager.getAll()).toEqual([
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
    expect(ExtensionManager.find('extension1')).toEqual({ id: 'extension1', builtIn: true, enabled: true });
    expect(ExtensionManager.find('does-not-exist')).toBeUndefined();
  });
});

describe('#loadAll', () => {
  it('loads built-in extensions and remote extensions that are enabled', async () => {
    const loadSpy = jest.spyOn(ExtensionManager, 'load');

    loadSpy.mockReturnValue(Promise.resolve());

    await ExtensionManager.loadAll();

    expect(loadSpy).toHaveBeenCalledTimes(2);
    expect(loadSpy).toHaveBeenCalledWith('extension1');
    expect(loadSpy).toHaveBeenCalledWith('extension2');
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
