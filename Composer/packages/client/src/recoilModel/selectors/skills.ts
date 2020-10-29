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
      let manifestId;
      if (manifests[currentSkillManifestIndex]) {
        manifest = manifests[currentSkillManifestIndex].content;
        manifestId = manifests[currentSkillManifestIndex].id;
      }

      const { isRemote } = get(projectMetaDataState(skillId));
      if (skillNameIdentifier) {
        result[skillNameIdentifier] = {
          id: skillId,
          manifest,
          manifestId,
          name: botName,
          remote: isRemote,
        };
      }
      return result;
    }, {});
    return skills;
  },
});

export const skillIdByProjectIdSelector = selector({
  key: 'skillIdByProjectIdSelector',
  get: ({ get }) => {
    const skillsProjectIds = get(skillsProjectIdSelector);
    const skills: Record<string, string> = skillsProjectIds.reduce((result, skillId: string) => {
      const skillNameIdentifier = get(botNameIdentifierState(skillId));
      if (skillNameIdentifier) {
        result[skillId] = skillNameIdentifier;
      }
      return result;
    }, {});
    return skills;
  },
});
