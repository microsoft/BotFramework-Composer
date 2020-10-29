// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionManifestStore, ExtensionManifest } from '../extensionManifestStore';

const manifestPath = '../../../__manifest__.json';

const currentManifest = ({
  extension1: {
    id: 'extension1',
  },
} as unknown) as ExtensionManifest;

let store = new ExtensionManifestStore(manifestPath);

beforeEach(() => {
  store = new ExtensionManifestStore(manifestPath);
  Object.entries(currentManifest).forEach(([id, data]) => {
    store.updateExtensionConfig(id, data ?? {});
  });
});

describe('#getExtensionConfig', () => {
  it('returns the extension metadata', () => {
    expect(store.getExtensionConfig('extension1')).toEqual(currentManifest.extension1);
  });
});

describe('#getExtensions', () => {
  it('returns all extension metadata', () => {
    expect(store.getExtensions()).toEqual(currentManifest);
  });
});

describe('#updateExtensionConfig', () => {
  it('creates a new entry if config does not exist', () => {
    const newExtension = { id: 'newExtension' };
    store.updateExtensionConfig('newExtension', newExtension);

    expect(store.getExtensionConfig('newExtension')).toEqual(newExtension);
  });

  it('updates the entry if config exist', () => {
    store.updateExtensionConfig('extension1', { name: 'new name' });

    expect(store.getExtensionConfig('extension1')).toEqual({ id: 'extension1', name: 'new name' });
  });
});

describe('#removeExtension', () => {
  it('removes the extension from the manifest', () => {
    store.removeExtension('extension1');

    expect(store.getExtensionConfig('extension1')).toBeUndefined();
    expect(store.getExtensions()).toEqual({});
  });
});
