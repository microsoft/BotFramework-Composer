// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import { existsSync, writeJsonSync, readJsonSync, read } from 'fs-extra';

import { Store } from '../store';

jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  readJsonSync: jest.fn(),
  writeJsonSync: jest.fn(),
}));

const testPath = path.resolve(__dirname, '../../../__manifest__.json');

afterAll(() => {
  if (fs.existsSync(testPath)) {
    fs.unlinkSync(testPath);
  }
});

describe('when the store does not exist on disk', () => {
  it('creates one with the default data', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    new Store(testPath, { defaultData: true });
    expect(writeJsonSync).toHaveBeenCalledWith(testPath, { defaultData: true }, { spaces: 2 });
  });
});

describe('when the manifest already exists', () => {
  const currentData = {
    some: 'data',
  };

  beforeAll(() => {
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }

    fs.writeFileSync(testPath, JSON.stringify({}));
  });

  beforeEach(() => {
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

  describe('#read', () => {
    it('returns current data', () => {
      const store = new Store<any>(testPath, { some: 'data' });
      expect(store.read()).toEqual({ some: 'data' });

      store.write({ some: 'data', new: 'data' });
      expect(store.read()).toEqual({ some: 'data', new: 'data' });
    });
  });

  describe('#write', () => {
    it('writes new data to disk', () => {
      const store = new Store(testPath, {});

      store.write({ new: 'data' });

      expect(writeJsonSync).toHaveBeenCalledWith(testPath, { new: 'data' }, { spaces: 2 });
    });
  });

  describe('#reload', () => {
    it('reads from the manifest', () => {
      const store = new Store(testPath, {});
      (readJsonSync as jest.Mock).mockClear();

      store.reload();
      expect(readJsonSync).toHaveBeenCalledWith(testPath);
    });
  });
});
