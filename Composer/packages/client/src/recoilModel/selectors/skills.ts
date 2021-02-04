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
  dialogIdsState,
  dialogState,
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

export const skillUsedInBotsSelector = selector({
  key: 'skillUsedInBotSelector',
  get: ({ get }) => {
    const botIds = get(botProjectIdsState);
    const skillsProjectIds = get(skillsProjectIdSelector);

    const skillInBots: Record<string, { projectId: string; name: string }[]> = skillsProjectIds.reduce(
      (result, skillId: string) => {
        const usedInBots: { projectId: string; name: string }[] = [];
        const skillNameIdentifier = get(botNameIdentifierState(skillId));

        botIds.forEach((projectId: string) => {
          const dialogIds = get(dialogIdsState(projectId));
          let beenUsed = false;
          dialogIds.forEach((dialogId) => {
            const dialog = get(dialogState({ projectId, dialogId }));
            if (dialog.skills.includes(skillNameIdentifier)) beenUsed = true;
          });
          if (beenUsed) {
            usedInBots.push({
              projectId,
              name: get(botDisplayNameState(projectId)),
            });
          }
        });
        result[skillId] = usedInBots;
        return result;
      },
      {}
    );
    return skillInBots;
  },
});
