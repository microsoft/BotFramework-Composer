// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getBaseName(filename: string, sep?: string): string | any {
  if (sep) return filename.substr(0, filename.lastIndexOf(sep));
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}
