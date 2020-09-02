// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function setEnvDefault(varName: string, value: string) {
  if (process.env[varName] === undefined) {
    process.env[varName] = value;
  }
}
