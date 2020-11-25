// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Skill } from '../../src';
import { convertSkillsToDictionary } from '../../src/skillsUtils';

describe('skills utils', () => {
  it('migrate skills array in older bots to skills dictionary', () => {
    const skills: Skill[] = [
      { name: 'oneNoteSync', manifestUrl: 'http://test.onenotesync/manifests/one-note.json' } as Skill,
      { name: 'googleSync', manifestUrl: 'http://test.googlesync/manifests/google-sync.json' } as Skill,
    ];
    const result = convertSkillsToDictionary(skills);
    expect(result.oneNoteSync.manifestUrl).toBe('http://test.onenotesync/manifests/one-note.json');
  });
});
