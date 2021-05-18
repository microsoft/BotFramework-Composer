/* eslint-disable security/detect-non-literal-fs-filename */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { exec } from 'child_process';

import { ExecResult } from '../types';

export const execAsync = (command: string): Promise<ExecResult> => {
  return new Promise<ExecResult>((resolve, reject) => {
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
      // Hack required because exec returns are insconsistent.
      if (!error) {
        stdout += stderr;
        stderr = undefined;
      }

      resolve({ stdout, stderr });
    });
  });
};
