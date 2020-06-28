// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';

import httpClient from '../../utils/httpUtil';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  skillsState,
  settingsState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
} from './../atoms/botState';

export const skillDispatcher = () => {
  const createSkillManifest = useRecoilCallback<[{ id: string; content: any }], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }) => {
      const skillManifests = await snapshot.getPromise(skillManifestsState);
      set(skillManifestsState, [...skillManifests, { content, id }]);
    }
  );

  const removeSkillManifest = useRecoilCallback<[string], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async (id: string) => {
      let skillManifests = await snapshot.getPromise(skillManifestsState);
      skillManifests = skillManifests.filter((manifest) => manifest.name === id);
      set(skillManifestsState, [...skillManifests]);
    }
  );

  const updateSkillManifest = useRecoilCallback<[{ id: string; content: any }], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }) => {
      let skillManifests = await snapshot.getPromise(skillManifestsState);
      skillManifests = skillManifests.map((manifest) => (manifest.id === id ? { id, content } : manifest));
      set(skillManifestsState, [...skillManifests]);
    }
  );

  const updateSkill = useRecoilCallback<[{ projectId: string; targetId: number; skillData: any }], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async ({ projectId, targetId, skillData }) => {
      const onAddSkillDialogComplete = await snapshot.getPromise(onAddSkillDialogCompleteState);
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

        const settings = await snapshot.getPromise(settingsState);
        const skills = response.data;
        settings.skill = skills.map(({ manifestUrl, name }) => {
          return { manifestUrl, name };
        });

        set(showAddSkillDialogModalState, false);
        set(onAddSkillDialogCompleteState, undefined);
        set(settingsState, settings);
        set(skillsState, skills);
      } catch (err) {
        //TODO: error
        console.log(err);
      }
    }
  );

  const addSkillDialogBegin = useRecoilCallback<[any], void>(({ set }: CallbackInterface) => (onComplete) => {
    set(showAddSkillDialogModalState, true);
    set(onAddSkillDialogCompleteState, onComplete);
  });

  const addSkillDialogCancel = useRecoilCallback<[], void>(({ set }: CallbackInterface) => () => {
    set(showAddSkillDialogModalState, false);
    set(onAddSkillDialogCompleteState, undefined);
  });

  const addSkillDialogSuccess = useRecoilCallback<[], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async () => {
      const onAddSkillDialogComplete = await snapshot.getPromise(onAddSkillDialogCompleteState);
      if (typeof onAddSkillDialogComplete === 'function') {
        onAddSkillDialogComplete(null);
      }

      set(showAddSkillDialogModalState, false);
      set(onAddSkillDialogCompleteState, undefined);
    }
  );

  const displayManifestModal = useRecoilCallback<[string], void>(({ set }: CallbackInterface) => (id: string) => {
    set(displaySkillManifestState, id);
  });

  const dismissManifestModal = useRecoilCallback<[], void>(({ set }: CallbackInterface) => () => {
    set(displaySkillManifestState, undefined);
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
