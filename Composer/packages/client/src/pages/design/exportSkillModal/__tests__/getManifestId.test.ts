// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getManifestId } from '../content';

describe('geManifestId', () => {
  it('should generate valid id without manifest schema version', () => {
    const result = getManifestId('test');
    expect(result).toEqual('test-manifest');
  });
});
