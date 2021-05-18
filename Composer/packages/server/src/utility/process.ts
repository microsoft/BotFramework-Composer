// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { exec } from 'child_process';

import { ChildProcessResult } from '../types/processResponse';

export const execAsync = (command: string): Promise<ChildProcessResult> => {
  return new Promise<ChildProcessResult>((resolve, reject) => {
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr: string | undefined) => {
      // Hack required because exec returns are insconsistent.
      if (error) {
        stderr = error.message;
      }

      resolve({ stdout, stderr });
    });
  });
};
