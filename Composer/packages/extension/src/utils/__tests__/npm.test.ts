// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { spawn } from 'child_process';

import { npm } from '../npm';

const mockProc = {
  stdout: {
    on: jest.fn(),
  },
  stderr: {
    on: jest.fn(),
  },
  on: jest.fn(),
};

jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => mockProc),
}));

describe('npm', () => {
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
