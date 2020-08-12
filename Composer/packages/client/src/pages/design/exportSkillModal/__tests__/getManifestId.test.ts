// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getManifestId } from '../content';

const skillManifest = {
  id: 'test',
  content: {
    $schema: 'https://schemas.botframework.com/schemas/skills/skill-manifest-2.1.1.json',
  },
};

describe('geManifestId', () => {
  it('should generate valid id without manifest schema version', () => {
    const result = getManifestId('test', [], {});
    expect(result).toEqual('test-manifest');
  });

  it('should generate valid, non-conflicting id without manifest schema version', () => {
    const skillManifests: any = [{ id: 'test-manifest' }, { id: 'test-manifest-0' }];
    const result = getManifestId('test', skillManifests, {});
    expect(result).toEqual('test-manifest-1');
  });

  it('should generate valid id with manifest schema version', () => {
    const result = getManifestId('test', [], skillManifest);
    expect(result).toEqual('test-2-1-1-manifest');
  });

  it('should generate valid, non-conflicting id with manifest schema version', () => {
    const skillManifests: any = [{ id: 'test-2-1-1-manifest' }, { id: 'test-2-1-1-manifest-0' }];
    const result = getManifestId('test', skillManifests, skillManifest);
    expect(result).toEqual('test-2-1-1-manifest-1');
  });
});
