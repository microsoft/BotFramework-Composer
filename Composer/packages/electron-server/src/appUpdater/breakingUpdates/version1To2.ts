// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lt, satisfies } from 'semver';

export const version1To2 = (curVersion: string, newVersion: string) => {
  const breaking = lt(curVersion, '2.0.0') && satisfies(newVersion, '>= 2.0.0 < 3.0.0');
  return { breaking, uxId: 'Version1.x.xTo2.x.x' };
};
