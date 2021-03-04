/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-child-process */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export class AzureTokenManager {
  public async GetAccessToken() {
    const { stdout, stderr } = await exec('az account get-access-token');
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  }

  public async GetGraphToken() {
    const { stdout, stderr } = await exec('az account get-access-token --resource-type ms-graph');
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  }
}
