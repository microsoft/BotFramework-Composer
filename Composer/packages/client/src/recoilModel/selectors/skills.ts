// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Skill, Manifest } from '@bfc/types';
import { selector } from 'recoil';

import {
  skillManifestsState,
  currentSkillManifestIndexState,
  botNameIdentifierState,
  botDisplayNameState,
  projectMetaDataState,
} from '../atoms';

import { skillsProjectIdSelector } from './project';

// Actions
export const skillsStateSelector = selector({
  key: 'skillsStateSelector',
  get: ({ get }) => {
    const skillsProjectIds = get(skillsProjectIdSelector);
    const skills: Record<string, Skill> = skillsProjectIds.reduce((result, skillId: string) => {
      const manifests = get(skillManifestsState(skillId));
      if (!manifests.length) {
        return [];
      }
      const currentSkillManifestIndex = get(currentSkillManifestIndexState(skillId));
      const skillNameIdentifier = get(botNameIdentifierState(skillId));
      const botName = get(botDisplayNameState(skillId));
      const manifest: Manifest = manifests[currentSkillManifestIndex].content;
      const { isRemote } = get(projectMetaDataState(skillId));
      if (skillNameIdentifier) {
        result[skillNameIdentifier] = {
          id: skillId,
          manifest,
          name: botName,
          remote: isRemote,
        };
      }
      return result;
    }, {});
    return skills;
  },
});
