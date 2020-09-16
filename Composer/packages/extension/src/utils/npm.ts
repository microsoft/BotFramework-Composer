// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { spawn } from 'child_process';

import logger from '../logger';

const log = logger.extend('npm');

type NpmOutput = {
  stdout: string;
  stderr: string;
};

/**
 * Executes npm commands that include user input safely
 * @param command npm command to execute including command line arguments
 * @returns Object with stdout and stderr from command
 */
export async function npm(command: string): Promise<NpmOutput> {
  return new Promise((resolve) => {
    log('npm %s', command);
    const cmdArgs = command.split(' ');
    let stdout = '';
    let stderr = '';

    const proc = spawn('npm', cmdArgs);

    proc.stdout.on('data', (data) => {
      stdout += data;
    });

    proc.stderr.on('data', (data) => {
      stderr += data;
    });

    proc.on('close', () => {
      resolve({ stdout, stderr });
    });
  });
}
