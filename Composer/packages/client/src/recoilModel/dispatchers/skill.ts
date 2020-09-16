// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifest, convertSkillsToDictionary, Skill } from '@bfc/shared';

import httpClient from '../../utils/httpUtil';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  skillsState,
  settingsState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
  projectIdState,
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

  const updateSkillState = async (
    callbackHelpers: CallbackInterface,
    updatedSkills: Skill[]
  ): Promise<Skill[] | undefined> => {
    try {
      const { set, snapshot } = callbackHelpers;
      const projectId = await snapshot.getPromise(projectIdState);

      const { data: skills } = await httpClient.post(`/projects/${projectId}/skills/`, { skills: updatedSkills });

      set(settingsState, (settings) => ({
        ...settings,
        skill: convertSkillsToDictionary(skills),
      }));
      set(skillsState, skills);

      return skills;
    } catch (error) {
      logMessage(callbackHelpers, error.message);
    }
  };

  const addSkill = useRecoilCallback((callbackHelpers: CallbackInterface) => async (skillData: Skill) => {
    const { set, snapshot } = callbackHelpers;
    const { func: onAddSkillDialogComplete } = await snapshot.getPromise(onAddSkillDialogCompleteState);
    const skills = await updateSkillState(callbackHelpers, [...(await snapshot.getPromise(skillsState)), skillData]);

    const skill = (skills || []).find(({ manifestUrl }) => manifestUrl === skillData.manifestUrl);

    if (typeof onAddSkillDialogComplete === 'function') {
      onAddSkillDialogComplete(skill || null);
    }

    set(showAddSkillDialogModalState, false);
    set(onAddSkillDialogCompleteState, {});
  });

  const removeSkill = useRecoilCallback((callbackHelpers: CallbackInterface) => async (manifestUrl?: string) => {
    const { snapshot } = callbackHelpers;
    const skills = [...(await snapshot.getPromise(skillsState))].filter((skill) => skill.manifestUrl !== manifestUrl);
    await updateSkillState(callbackHelpers, skills);
  });

  const updateSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ targetId, skillData }: { targetId: number; skillData?: any }) => {
      const { snapshot } = callbackHelpers;
      const originSkills = [...(await snapshot.getPromise(skillsState))];

      if (targetId >= 0 && targetId < originSkills.length && skillData) {
        originSkills.splice(targetId, 1, skillData);
      } else {
        throw new Error(`update out of range, skill not found`);
      }

      updateSkillState(callbackHelpers, originSkills);
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

  return {
    addSkill,
    createSkillManifest,
    removeSkillManifest,
    updateSkillManifest,
    updateSkill,
    addSkillDialogBegin,
    addSkillDialogCancel,
    addSkillDialogSuccess,
    displayManifestModal,
    dismissManifestModal,
    removeSkill,
  };
};
