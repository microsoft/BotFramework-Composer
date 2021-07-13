// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { convertFolderNameToSkillName } from '../util';

describe('Convert zip folder name to skill name', () => {
  it('should return path with skillName folder', () => {
    const path = 'manifest/empty-manifest.json';
    const skillName = 'empty';
    expect(convertFolderNameToSkillName(path, skillName)).toEqual('empty/empty-manifest.json');
  });
});
