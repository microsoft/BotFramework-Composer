// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { promisify } from 'util';

import { mkdir } from 'fs-extra';
import fetch from 'node-fetch';
import tar from 'tar';

import logger from '../logger';

const streamPipeline = promisify(require('stream').pipeline);

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/order
const rimraf = promisify(require('rimraf'));

const log = logger.extend('npm');

type NpmOutput = {
  stdout: string;
  stderr: string;
  code: number;
};
type NpmCommand = 'search';
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
  spawnOpts: SpawnOptionsWithoutStdio = {},
  platform = process.platform
): Promise<NpmOutput> {
  return new Promise((resolve, reject) => {
    const cmdOptions = processOptions(opts);
    const spawnArgs = [command, ...cmdOptions, args];
    log('npm %s', spawnArgs.join(' '));
    let stdout = '';
    let stderr = '';

    const proc = spawn('npm', spawnArgs, { ...spawnOpts, shell: platform === 'win32' });

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

export async function downloadPackage(name: string, versionOrTag: string, destination: string) {
  const dLog = log.extend(name);
  dLog('Starting download.');
  const res = await fetch(`https://registry.npmjs.org/${name}`);
  const metadata = await res.json();
  const targetVersion = metadata['dist-tags'][versionOrTag] ?? versionOrTag;

  dLog('Resolved version %s to %s', versionOrTag, targetVersion);

  const tarballUrl = metadata.versions[targetVersion]?.dist.tarball;

  if (!tarballUrl) {
    dLog('Unable to get tarball url.');
    throw new Error(`Could not find ${name}@${targetVersion} on npm.`);
  }

  dLog('Fetching tarball.');
  const tarball = (await fetch(tarballUrl)).body;
  // clean up previous version
  await rimraf(destination);
  await mkdir(destination);

  dLog('Extracting tarball.');
  await streamPipeline(
    tarball,
    tar.extract({
      strip: 1,
      C: destination,
      strict: true,
    })
  );
  dLog('Done downloading.');
}
