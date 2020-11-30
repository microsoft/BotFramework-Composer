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
  locationState,
  botProjectIdsState,
} from '../atoms';

export const skillsProjectIdSelector = selector({
  key: 'skillsProjectIdSelector',
  get: ({ get }) => {
    const botIds = get(botProjectIdsState);
    return botIds.filter((projectId: string) => {
      const { isRootBot } = get(projectMetaDataState(projectId));
      return !isRootBot;
    });
  },
});

export interface SkillInfo extends Skill {
  manifestId: string;
  location: string; // path to skill bot or manifest url
  remote: boolean;
}
// Actions
export const skillsStateSelector = selector({
  key: 'skillsStateSelector',
  get: ({ get }) => {
    const skillsProjectIds = get(skillsProjectIdSelector);
    const skills: Record<string, SkillInfo> = skillsProjectIds.reduce((result, skillId: string) => {
      const manifests = get(skillManifestsState(skillId));
      const location = get(locationState(skillId));
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
          name: botName,
          remote: isRemote,
          manifestId,
          location,
        };
      }
      return result;
    }, {});
    return skills;
  },
});

export const skillNameIdentifierByProjectIdSelector = selector({
  key: 'skillNameIdentifierByProjectIdSelector',
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
