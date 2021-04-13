// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import util = require('util');
import childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

/**
 * Get access token by az cli.
 * @returns Access token.
 */
export async function getAccessToken(): Promise<string> {
  const { stdout, stderr } = await exec('az account get-access-token');
  if (stderr) {
    throw new Error(stderr);
  }

  if (!stdout) {
    throw new Error(stderr);
  }

  return stdout.trim();
}

/**
 * Get ms-graph access token by az cli.
 * @returns ms-graph access token.
 */
export async function getGraphToken(): Promise<string> {
  const { stdout, stderr } = await exec('az account get-access-token --resource-type ms-graph');
  if (stderr) {
    throw new Error(stderr);
  }

  if (!stdout) {
    throw new Error(stderr);
  }

  return stdout.trim();
}
