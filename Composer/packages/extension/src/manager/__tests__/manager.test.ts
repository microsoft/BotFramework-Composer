// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { writeJsonSync } from 'fs-extra';

import { npm } from '../../utils/npm';
import { ExtensionManager } from '../manager';

jest.mock('../../utils/npm', () => ({
  npm: jest.fn(),
}));

const mockManifest = {
  extension1: {
    id: 'extension1',
  },
  extension2: {
    id: 'extension2',
  },
};

beforeEach(() => {
  process.env.COMPOSER_EXTENSION_DATA = path.resolve(__dirname, '../../../__manifest__.json');
  writeJsonSync(process.env.COMPOSER_EXTENSION_DATA, mockManifest);
});

afterEach(() => {
  delete process.env.COMPOSER_EXTENSION_DATA;
});

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
