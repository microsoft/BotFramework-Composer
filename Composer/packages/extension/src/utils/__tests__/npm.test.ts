// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */
import { Readable, Writable } from 'stream';

import fetch from 'node-fetch';
import { mkdir, remove } from 'fs-extra';
import tar from 'tar';

import { search, downloadPackage } from '../npm';

class MockBody extends Readable {
  _read() {
    setTimeout(() => {
      this.emit('end');
    }, 1);
  }
}

class MockExtractor extends Writable {
  _write(chunk: any, enc: string, next) {
    next();
  }
}

jest.mock('node-fetch', () => jest.fn());
jest.mock('fs-extra', () => ({
  mkdir: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('tar', () => ({
  extract: jest.fn(),
}));

describe('search', () => {
  const data = [
    {
      name: 'package1',
      description: 'package1 description',
      version: '0.0.1',
      keywords: ['foo'],
      links: { npm: 'package1 npm link' },
    },
    { name: 'package2', description: 'package2 description', version: '0.0.2' },
  ];

  beforeEach(() => {
    const mockRes = {
      json: jest.fn(),
    };
    ((fetch as unknown) as jest.Mock).mockImplementation(() => mockRes);
    mockRes.json.mockResolvedValue({ objects: data.map((d) => ({ package: d })) });
  });

  it('returns results of npm search', async () => {
    const results = await search('my query');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('registry.npmjs.org/-/v1/search?text=my+query+keywords:botframework-composer')
    );

    expect(results).toEqual([
      {
        id: 'package1',
        description: 'package1 description',
        version: '0.0.1',
        keywords: ['foo'],
        url: 'package1 npm link',
      },
      {
        id: 'package2',
        description: 'package2 description',
        version: '0.0.2',
        keywords: [],
        url: '',
      },
    ]);
  });
});

describe('downloadPackage', () => {
  const packageName = 'some-package';

  const packageMetadata = {
    'dist-tags': {
      latest: '1.0.1',
    },
    versions: {
      '1.0.0': {
        dist: {
          tarball: 'tarball url 1.0.0',
        },
      },
      '1.0.1': {
        dist: {
          tarball: 'tarball url 1.0.1',
        },
      },
    },
  };

  beforeEach(() => {
    const mockRes = {
      json: jest.fn(),
      body: new MockBody(),
    };
    ((fetch as unknown) as jest.Mock).mockImplementation(() => mockRes);
    mockRes.json.mockResolvedValue(packageMetadata);

    const extractor = new MockExtractor();
    (tar.extract as jest.Mock).mockReturnValue(extractor);

    mockRes.body.push('some data');
  });

  it('gets package metadata from npm', async () => {
    await downloadPackage(packageName, 'latest', '/some/path');

    expect(fetch).toHaveBeenCalledWith('https://registry.npmjs.org/some-package');
  });

  it.each([
    ['latest', '1.0.1'],
    ['1.0.0', '1.0.0'],
  ])('can resolve %s to %s', async (tagOrVersion, expectedVersion) => {
    await downloadPackage(packageName, tagOrVersion, '/some/path');
    expect(fetch).toHaveBeenCalledWith(`tarball url ${expectedVersion}`);
  });

  it('throws when version not found', () => {
    expect(downloadPackage(packageName, '2.0.0', '/some/path')).rejects.toThrow(/Could not find/);
  });

  it('prepares the destination directory', async () => {
    await downloadPackage(packageName, 'latest', '/some/path');
    expect(remove).toHaveBeenCalledWith('/some/path');
    expect(mkdir).toHaveBeenCalledWith('/some/path');
  });

  it('extracts the tarball into destination', async () => {
    await downloadPackage(packageName, 'latest', '/some/path');

    expect(tar.extract).toHaveBeenCalledWith({ strip: 1, C: '/some/path', strict: true });
  });
});
