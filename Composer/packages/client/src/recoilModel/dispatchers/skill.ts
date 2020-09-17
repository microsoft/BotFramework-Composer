// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifest, SkillSetting } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
  settingsState,
} from './../atoms/botState';
import { setSettingState } from './setting';

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

  const addSkillDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => (onComplete) => {
    set(showAddSkillDialogModalState, true);
    set(onAddSkillDialogCompleteState, { func: onComplete });
  });

  const addSkillDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(showAddSkillDialogModalState, false);
    set(onAddSkillDialogCompleteState, {});
  });

  const displayManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (id: string) => {
    set(displaySkillManifestState, id);
  });

  const dismissManifestModal = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(displaySkillManifestState, undefined);
  });

  const addSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, skill: SkillSetting) => {
      const { set, snapshot } = callbackHelpers;
      const { func: onAddSkillDialogComplete } = await snapshot.getPromise(onAddSkillDialogCompleteState);
      const settings = await snapshot.getPromise(settingsState);

      setSettingState(callbackHelpers, projectId, {
        ...settings,
        skill: {
          ...settings.skill,
          [skill.name]: skill,
        },
      });

      if (typeof onAddSkillDialogComplete === 'function') {
        onAddSkillDialogComplete(skill || null);
      }

      set(showAddSkillDialogModalState, false);
      set(onAddSkillDialogCompleteState, {});
    }
  );

  const removeSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, key: string) => {
      const { snapshot } = callbackHelpers;
      const settings = await snapshot.getPromise(settingsState);
      const newSettings = cloneDeep(settings);
      delete newSettings.skill?.[key];

      setSettingState(callbackHelpers, projectId, newSettings);
    }
  );

  const updateSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      key: string,
      { endpointUrl, manifestUrl, msAppId, name }: SkillSetting
    ) => {
      const { snapshot } = callbackHelpers;
      const settings = await snapshot.getPromise(settingsState);
      const newSettings = cloneDeep(settings);
      setSettingState(callbackHelpers, projectId, {
        ...newSettings,
        skill: {
          ...newSettings?.skill,
          [key]: {
            endpointUrl,
            manifestUrl,
            msAppId,
            name,
          },
        },
      });
    }
  );

  return {
    addSkill,
    removeSkill,
    updateSkill,
    createSkillManifest,
    removeSkillManifest,
    updateSkillManifest,
    addSkillDialogBegin,
    addSkillDialogCancel,
    displayManifestModal,
    dismissManifestModal,
  };
};
