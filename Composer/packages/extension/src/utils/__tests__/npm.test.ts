// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */
import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';

import fetch from 'node-fetch';
import rimraf from 'rimraf';
import { mkdir } from 'fs-extra';
import tar from 'tar';

import { npm, search, downloadPackage } from '../npm';

const mockProc = {
  stdout: {
    on: jest.fn(),
  },
  stderr: {
    on: jest.fn(),
  },
  on: jest.fn(),
};

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

jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => mockProc),
}));

jest.mock('node-fetch', () => jest.fn());
jest.mock('rimraf', () => {
  return jest.fn().mockImplementation((path, cb) => {
    cb();
  });
});
jest.mock('fs-extra', () => ({
  mkdir: jest.fn(),
}));
jest.mock('tar', () => ({
  extract: jest.fn(),
}));

beforeEach(() => {
  mockProc.stdout.on.mockImplementation((event, cb) => {
    if (event === 'data') {
      cb('stdout data');
    }
  });
  mockProc.stderr.on.mockImplementation((event, cb) => {
    if (event === 'data') {
      cb('stderr data');
    }
  });
  mockProc.on.mockImplementation((event, cb) => {
    if (event === 'close') {
      cb(0);
    }
  });
});

describe('npm', () => {
  it('spawns an npm process', async () => {
    const { stdout, stderr, code } = await npm('search', 'arg1 arg2', { '--prefix': '/foo' }, { cwd: '/foo' });
    expect(spawn).toHaveBeenCalledWith(
      'npm',
      ['search', '--no-fund', '--no-audit', '--quiet', '--prefix=/foo', 'arg1 arg2'],
      {
        cwd: '/foo',
        shell: false,
      }
    );
    expect(stdout).toEqual('stdout data');
    expect(stderr).toEqual('stderr data');
    expect(code).toEqual(0);
  });

  it('uses a shell if on windows', async () => {
    await npm('search', '', {}, {}, 'win32');
    expect(spawn).toHaveBeenCalledWith('npm', expect.any(Array), { shell: true });
  });

  it('rejects when error', () => {
    mockProc.on.mockImplementation((event, cb) => {
      if (event === 'close') {
        cb(1);
      }
    });
    expect(npm('search', '')).rejects.toEqual(expect.objectContaining({ code: 1 }));
  });
});

describe('search', () => {
  const stdout = [{ name: 'package1' }, { name: 'package2' }];

  beforeEach(() => {
    mockProc.stdout.on.mockImplementation((event, cb) => {
      if (event === 'data') {
        cb(JSON.stringify(stdout));
      }
    });
  });

  it('returns results of npm search', async () => {
    const results = await search();

    expect(spawn).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining(['search', '--searchopts="keywords:botframework-composer extension"', '--json']),
      expect.any(Object)
    );

    expect(results).toEqual(stdout);
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
    expect(rimraf).toHaveBeenCalledWith('/some/path', expect.any(Function));
    expect(mkdir).toHaveBeenCalledWith('/some/path');
  });

  it('extracts the tarball into destination', async () => {
    await downloadPackage(packageName, 'latest', '/some/path');

    expect(tar.extract).toHaveBeenCalledWith({ strip: 1, C: '/some/path', strict: true });
  });
});
