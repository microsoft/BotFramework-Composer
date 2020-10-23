// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';

import { Store } from '../store';

jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  readJsonSync: jest.fn(),
  writeJsonSync: jest.fn(),
}));

const testPath = path.resolve(__dirname, '../../../__manifest__.json');

beforeAll(() => {
  // enable writing to disk for this test only
  process.env.NODE_ENV = 'jest';
});

afterAll(() => {
  if (fs.existsSync(testPath)) {
    fs.unlinkSync(testPath);
  }
  process.env.NODE_ENV = 'test';
});

describe('when the store does not exist on disk', () => {
  it('creates one with the default data', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    new Store(testPath, { defaultData: true });
    expect(writeJsonSync).toHaveBeenCalledWith(testPath, { defaultData: true }, { spaces: 2 });
  });
});

describe('when the manifest already exists', () => {
  let currentData = {};

  beforeAll(() => {
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }

    fs.writeFileSync(testPath, JSON.stringify({}));
  });

  beforeEach(() => {
    currentData = {
      some: 'data',
    };

    (existsSync as jest.Mock).mockReturnValue(true);
    (readJsonSync as jest.Mock).mockImplementation((path) => {
      if (path === testPath) {
        return { ...currentData };
      }
    });
  });

  it('reads from the manifest', () => {
    new Store(testPath, {});
    expect(readJsonSync).toHaveBeenCalledWith(testPath);
  });

  describe('#readAll', () => {
    it('returns current data', () => {
      const store = new Store(testPath, currentData);
      (readJsonSync as jest.Mock).mockClear();
      expect(store.readAll()).toEqual({ some: 'data' });
      expect(readJsonSync).toHaveBeenCalled();

      currentData = { some: 'data', new: 'data' };
      store.replace(currentData);
      expect(store.readAll()).toEqual(currentData);
    });
  });

  describe('#read', () => {
    it('can read a key from the store', () => {
      const store = new Store(testPath, currentData);
      expect(store.read('some')).toEqual('data');
      expect(store.read('foo')).toBeUndefined();
    });
  });

  describe('#write', () => {
    it('writes a single value into the store', () => {
      const store = new Store(testPath, currentData);
      (writeJsonSync as jest.Mock).mockClear();
      store.write('new', 'value');
      expect(writeJsonSync).toHaveBeenCalledWith(testPath, expect.objectContaining({ new: 'value' }), { spaces: 2 });
    });
  });

  describe('#delete', () => {
    it('removes a single value from the store', () => {
      currentData = { ...currentData, new: 'value' };
      const store = new Store(testPath, currentData);
      (writeJsonSync as jest.Mock).mockClear();
      store.delete('new');
      expect(writeJsonSync).toHaveBeenCalledWith(testPath, { some: 'data' }, { spaces: 2 });
    });
  });

  describe('#replace', () => {
    it('writes new data to disk', () => {
      const store = new Store(testPath, {});

      currentData = { new: 'data' };
      store.replace(currentData);

      expect(writeJsonSync).toHaveBeenCalledWith(testPath, currentData, { spaces: 2 });
      expect(store.readAll()).toEqual(currentData);
    });
  });
});
