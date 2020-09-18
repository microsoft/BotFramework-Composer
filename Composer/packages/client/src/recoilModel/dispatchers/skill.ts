// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifest, SkillSetting } from '@bfc/shared';
import produce from 'immer';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
  settingsState,
} from './../atoms/botState';
import { setSettingState } from './setting';

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

  const addSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, skill: SkillSetting) => {
      const { set, snapshot } = callbackHelpers;
      const { func: onAddSkillDialogComplete } = await snapshot.getPromise(onAddSkillDialogCompleteState(projectId));
      const settings = await snapshot.getPromise(settingsState(projectId));

      setSettingState(
        callbackHelpers,
        projectId,
        produce(settings, (updateSettings) => {
          updateSettings.skill = { ...(updateSettings.skill || {}), [skill.name]: skill };
        })
      );

      if (typeof onAddSkillDialogComplete === 'function') {
        onAddSkillDialogComplete(skill || null);
      }

      set(showAddSkillDialogModalState(projectId), false);
      set(onAddSkillDialogCompleteState(projectId), {});
    }
  );

  const removeSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, key: string) => {
      const { snapshot } = callbackHelpers;
      const settings = await snapshot.getPromise(settingsState(projectId));

      setSettingState(
        callbackHelpers,
        projectId,
        produce(settings, (updateSettings) => {
          delete updateSettings.skill?.[key];
        })
      );
    }
  );

  const updateSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      key: string,
      { endpointUrl, manifestUrl, msAppId, name }: SkillSetting
    ) => {
      const { snapshot } = callbackHelpers;
      const settings = await snapshot.getPromise(settingsState(projectId));

      setSettingState(
        callbackHelpers,
        projectId,
        produce(settings, (updateSettings) => {
          updateSettings.skill = {
            ...(updateSettings.skill || {}),
            [key]: {
              endpointUrl,
              manifestUrl,
              msAppId,
              name,
            },
          };
        })
      );
    }
  );

  const addSkillDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => (onComplete, projectId: string) => {
    set(showAddSkillDialogModalState(projectId), true);
    set(onAddSkillDialogCompleteState(projectId), { func: onComplete });
  });

  const addSkillDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => (projectId: string) => {
    set(showAddSkillDialogModalState(projectId), false);
    set(onAddSkillDialogCompleteState(projectId), {});
  });

  const displayManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (id: string, projectId: string) => {
    set(displaySkillManifestState(projectId), id);
  });

  const dismissManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (projectId: string) => {
    set(displaySkillManifestState(projectId), undefined);
  });

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
