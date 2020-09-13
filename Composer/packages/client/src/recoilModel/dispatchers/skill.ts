// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifest, convertSkillsToDictionary } from '@bfc/shared';

import httpClient from '../../utils/httpUtil';

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
  const createSkillManifest = ({ set }, { id, content, projectId }) => {
    set(skillManifestsState(projectId), (skillManifests) => [...skillManifests, { content, id }]);
  };

  const removeSkillManifest = useRecoilCallback(
    ({ set }: CallbackInterface) => async (id: string, projectId: string) => {
      set(skillManifestsState(projectId), (skillManifests) => skillManifests.filter((manifest) => manifest.id !== id));
    }
  );

  const updateSkillManifest = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: SkillManifest, projectId: string) => {
      const manifests = await snapshot.getPromise(skillManifestsState(projectId));
      if (!manifests.some((manifest) => manifest.id === id)) {
        createSkillManifest({ set }, { id, content, projectId });
      }

      set(skillManifestsState(projectId), (skillManifests) =>
        skillManifests.map((manifest) => (manifest.id === id ? { id, content } : manifest))
      );
    }
  );

  const updateSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId, targetId, skillData }) => {
      const { set, snapshot } = callbackHelpers;
      const onAddSkillDialogComplete = (await snapshot.getPromise(onAddSkillDialogCompleteState(projectId))).func;
      const originSkills = [...(await snapshot.getPromise(skillsState(projectId)))];

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

        set(showAddSkillDialogModalState(projectId), false);
        set(onAddSkillDialogCompleteState(projectId), { func: undefined });
        set(settingsState(projectId), (settings) => ({
          ...settings,
          skill: convertSkillsToDictionary(skills),
        }));
        set(skillsState(projectId), skills);
      } catch (err) {
        //TODO: error
        logMessage(callbackHelpers, err.message);
      }
    }
  );

  const addSkillDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => (onComplete, projectId: string) => {
    set(showAddSkillDialogModalState(projectId), true);
    set(onAddSkillDialogCompleteState(projectId), { func: onComplete });
  });

  const addSkillDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => (projectId: string) => {
    set(showAddSkillDialogModalState(projectId), false);
    set(onAddSkillDialogCompleteState(projectId), { func: undefined });
  });

  const addSkillDialogSuccess = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (projectId: string) => {
      const onAddSkillDialogComplete = (await snapshot.getPromise(onAddSkillDialogCompleteState(projectId))).func;
      if (typeof onAddSkillDialogComplete === 'function') {
        onAddSkillDialogComplete(null);
      }

      set(showAddSkillDialogModalState(projectId), false);
      set(onAddSkillDialogCompleteState(projectId), { func: undefined });
    }
  );

  const displayManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (id: string, projectId: string) => {
    set(displaySkillManifestState(projectId), id);
  });

  const dismissManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (projectId: string) => {
    set(displaySkillManifestState(projectId), undefined);
  });

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
  };
};
