// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Skill } from '@bfc/shared';
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
      const currentSkillManifestIndex = get(currentSkillManifestIndexState(skillId));
      const skillNameIdentifier = get(botNameIdentifierState(skillId));
      const botName = get(botDisplayNameState(skillId));
      let manifest = undefined;
      if (manifests[currentSkillManifestIndex]) {
        manifest = manifests[currentSkillManifestIndex].content;
      }

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
