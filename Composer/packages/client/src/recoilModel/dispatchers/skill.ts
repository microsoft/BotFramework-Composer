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
import { dispatcherState } from '../DispatcherWrapper';
import { getSkillNameIdentifier } from './utils/project';

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
      const dispatcher = await snapshot.getPromise(dispatcherState);
      const { func: onAddSkillDialogComplete } = await snapshot.getPromise(onAddSkillDialogCompleteState(projectId));
      const settings = await snapshot.getPromise(settingsState(projectId));
      const skillName = await getSkillNameIdentifier(callbackHelpers, skill.name);

      setSettingState(
        callbackHelpers,
        projectId,
        produce(settings, (updateSettings) => {
          updateSettings.skill = { ...(updateSettings.skill || {}), [skillName]: skill };
        })
      );

      if (typeof onAddSkillDialogComplete === 'function') {
        onAddSkillDialogComplete(skill || null);
      }

      // sync to *.botproj
      // TODO: skill.endpointUrl to skill.endpointName
      await dispatcher.addRemoteSkillToBotProject(skill.manifestUrl, skillName, skill.endpointUrl);

      set(showAddSkillDialogModalState(projectId), false);
      set(onAddSkillDialogCompleteState(projectId), {});
    }
  );

  const removeSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, key: string) => {
      const { snapshot } = callbackHelpers;
      const dispatcher = await snapshot.getPromise(dispatcherState);
      const settings = await snapshot.getPromise(settingsState(projectId));

      setSettingState(
        callbackHelpers,
        projectId,
        produce(settings, (updateSettings) => {
          delete updateSettings.skill?.[key];
        })
      );

      // sync to *.botproj
      await dispatcher.removeRemoteSkillFromBotProject(key);
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
