// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionManager } from '../manager';

describe('#getAll', () => {
  it('return an array of all extensions', () => {
    expect(ExtensionManager.getAll()).toEqual([
      {
        id: 'extension1',
      },
      {
        id: 'extension2',
      },
    ]);
  });
});

describe('#find', () => {
  it('returns extension metadata for id', () => {
    expect(ExtensionManager.find('extension1')).toEqual({ id: 'extension1' });
    expect(ExtensionManager.find('does-not-exist')).toBeUndefined();
  });
});

describe('#loadAll', () => {
  it('loads built-in extensions and remote extensions', async () => {
    const builtinSpy = jest.spyOn(ExtensionManager, 'loadBuiltinExtensions');
    const remoteSpy = jest.spyOn(ExtensionManager, 'loadRemoteExtensions');

    builtinSpy.mockReturnValue(Promise.resolve());
    remoteSpy.mockReturnValue(Promise.resolve());

    await ExtensionManager.loadAll();

    expect(builtinSpy).toHaveBeenCalled();
    expect(remoteSpy).toHaveBeenCalled();
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
