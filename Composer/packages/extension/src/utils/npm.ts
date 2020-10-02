// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

import logger from '../logger';

const log = logger.extend('npm');

type NpmOutput = {
  stdout: string;
  stderr: string;
  code: number;
};
type NpmCommand = 'install' | 'uninstall' | 'search' | 'link';
type NpmOptions = {
  [key: string]: string;
};

function processOptions(opts: NpmOptions) {
  return Object.entries({ '--no-fund': '', '--no-audit': '', '--quiet': '', ...opts }).map(([flag, value]) => {
    return value ? `${flag}=${value}` : flag;
  });
}

/**
 * Executes npm commands that include user input safely
 * @param `command` npm command to execute.
 * @param `args` cli arguments
 * @param `opts` cli flags
 * @param `spawnOpts` options to pass to spawn command
 * @returns Object with stdout, stderr, and exit code from command
 */
export async function npm(
  command: NpmCommand,
  args: string,
  opts: NpmOptions = {},
  spawnOpts: SpawnOptionsWithoutStdio = {}
): Promise<NpmOutput> {
  return new Promise((resolve, reject) => {
    const cmdOptions = processOptions(opts);
    const spawnArgs = [command, ...cmdOptions, args];
    log('npm %s', spawnArgs.join(' '));
    let stdout = '';
    let stderr = '';

    const proc = spawn('npm', spawnArgs, { ...spawnOpts, shell: process.platform === 'win32' });

    proc.stdout.on('data', (data) => {
      stdout += data;
    });

    proc.stderr.on('data', (data) => {
      stderr += data;
    });

    proc.on('close', (code) => {
      if (code > 0) {
        reject({ stdout, stderr, code });
      } else {
        resolve({ stdout, stderr, code });
      }
    });
  });
}
