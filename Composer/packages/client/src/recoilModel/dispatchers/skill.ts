// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifest, DialogSetting } from '@bfc/shared';
import get from 'lodash/get';

import httpClient from '../../utils/httpUtil';
import { convertSkillsToDictionary } from '../../utils/backwardCompatibilityHandler';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  skillsState,
  settingsState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
} from './../atoms/botState';
import { logMessage } from './shared';

export const skillDispatcher = () => {
  const createSkillManifest = useRecoilCallback(({ set }: CallbackInterface) => async ({ id, content }) => {
    set(skillManifestsState, (skillManifests) => [...skillManifests, { content, id }]);
  });

  const removeSkillManifest = useRecoilCallback(({ set }: CallbackInterface) => async (id: string) => {
    set(skillManifestsState, (skillManifests) => skillManifests.filter((manifest) => manifest.id !== id));
  });

  const updateSkillManifest = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: SkillManifest) => {
      const manifests = await snapshot.getPromise(skillManifestsState);
      if (!manifests.some((manifest) => manifest.id === id)) {
        createSkillManifest({ id, content });
      }

      set(skillManifestsState, (skillManifests) =>
        skillManifests.map((manifest) => (manifest.id === id ? { id, content } : manifest))
      );
    }
  );

  const updateSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId, targetId, skillData }) => {
      const { set, snapshot } = callbackHelpers;
      const onAddSkillDialogComplete = (await snapshot.getPromise(onAddSkillDialogCompleteState)).func;
      const originSkills = [...(await snapshot.getPromise(skillsState))];

      // add
      if (targetId === -1 && skillData) {
        originSkills.push(skillData);
      } else if (targetId >= 0 && targetId < originSkills.length) {
        // modify
        if (skillData) {
          originSkills.splice(targetId, 1, skillData);

          // delete
        } else {
          originSkills.splice(targetId, 1);
        }
        // error
      } else {
        throw new Error(`update out of range, skill not found`);
      }

      try {
        const response = await httpClient.post(`/projects/${projectId}/skills/`, { skills: originSkills });

        if (typeof onAddSkillDialogComplete === 'function') {
          const skill = response.data.find(({ manifestUrl }) => manifestUrl === skillData.manifestUrl);
          onAddSkillDialogComplete(skill ? skill : null);
        }

        const skills = response.data;

        set(showAddSkillDialogModalState, false);
        set(onAddSkillDialogCompleteState, { func: undefined });
        set(settingsState, (settings) => ({
          ...settings,
          skill: convertSkillsToDictionary(skills),
        }));
        set(skillsState, skills);
      } catch (err) {
        //TODO: error
        logMessage(callbackHelpers, err.message);
      }
    }
  );

  const addSkillDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => (onComplete) => {
    set(showAddSkillDialogModalState, true);
    set(onAddSkillDialogCompleteState, { func: onComplete });
  });

  const addSkillDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(showAddSkillDialogModalState, false);
    set(onAddSkillDialogCompleteState, { func: undefined });
  });

  const addSkillDialogSuccess = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async () => {
    const onAddSkillDialogComplete = (await snapshot.getPromise(onAddSkillDialogCompleteState)).func;
    if (typeof onAddSkillDialogComplete === 'function') {
      onAddSkillDialogComplete(null);
    }

    set(showAddSkillDialogModalState, false);
    set(onAddSkillDialogCompleteState, { func: undefined });
  });

  const displayManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (id: string) => {
    set(displaySkillManifestState, id);
  });

  const dismissManifestModal = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(displaySkillManifestState, undefined);
  });

  const updateSkillsInSetting = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (
      skillName: string,
      skillInfo: { endpointUrl: string; msAppId: string }
    ) => {
      const currentSettings: DialogSetting = await snapshot.getPromise(settingsState);
      const matchedSkill = get(currentSettings, `skill[${skillName}]`, {});
      if (matchedSkill) {
        set(settingsState, {
          ...currentSettings,
          skill: {
            [skillName]: {
              ...matchedSkill,
              ...skillInfo,
            },
          },
        });
      }
    }
  );

  return {
    createSkillManifest,
    removeSkillManifest,
    updateSkillManifest,
    updateSkill,
    addSkillDialogBegin,
    addSkillDialogCancel,
    addSkillDialogSuccess,
    displayManifestModal,
    dismissManifestModal,
    updateSkillsInSetting,
  };
};
