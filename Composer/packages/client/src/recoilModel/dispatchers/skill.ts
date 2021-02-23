// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifestFile } from '@bfc/shared';
import produce from 'immer';

import { rootBotProjectIdSelector, skillsStateSelector } from '../selectors';
import {
  skillManifestsState,
  displaySkillManifestState,
  botProjectFileState,
  settingsState,
  botEndpointsState,
  dispatcherState,
} from '../atoms';

import { setRootBotSettingState } from './setting';

export const skillDispatcher = () => {
  // For endpoints in manifests the settings are updated immediately in SelectSkill. If "Composer Local" is chosen needs updating when rootbot is started.
  const updateSettingsForSkillsWithoutManifest = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { snapshot } = callbackHelpers;
    const botEndpoints = await snapshot.getPromise(botEndpointsState);
    const skills = await snapshot.getPromise(skillsStateSelector);
    const rootBotId = await snapshot.getPromise(rootBotProjectIdSelector);
    if (!rootBotId) {
      return;
    }
    const settings = await snapshot.getPromise(settingsState(rootBotId));
    let updatedSettings = { ...settings };
    const botProjectFile = await snapshot.getPromise(botProjectFileState(rootBotId));
    if (!botProjectFile) {
      return;
    }

    for (const skillNameIdentifier in botProjectFile.content.skills) {
      const botProjectSkill = botProjectFile.content.skills[skillNameIdentifier];
      const projectId = skills[skillNameIdentifier]?.id;
      const currentSetting = await snapshot.getPromise(settingsState(projectId));

      // Update settings only for skills that have chosen the "Composer local" endpoint and not manifest endpoints
      if (projectId && botEndpoints[projectId] && !botProjectSkill.endpointName) {
        updatedSettings = produce(updatedSettings, (draftState) => {
          if (!draftState.skill) {
            draftState.skill = {};
          }
          draftState.skill[skillNameIdentifier] = {
            endpointUrl: botEndpoints[projectId],
            msAppId: currentSetting.MicrosoftAppId ?? '',
          };
        });
      }
    }
    setRootBotSettingState(callbackHelpers, rootBotId, updatedSettings);
  });

  const createSkillManifest = async (callbackHelpers: CallbackInterface, { id, content, projectId }) => {
    const { set, snapshot } = callbackHelpers;
    let manifestForBotProjectFile;
    const dispatcher = await snapshot.getPromise(dispatcherState);
    set(skillManifestsState(projectId), (skillManifests) => {
      if (!skillManifests.length) {
        manifestForBotProjectFile = id;
      }
      return [...skillManifests, { content, id }];
    });
    if (manifestForBotProjectFile) {
      dispatcher.updateManifestInBotProjectFile(projectId, id);
    }
  };

  const removeSkillManifest = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (id: string, projectId: string) => {
      let newCurrentManifestId: string | undefined;
      const dispatcher = await snapshot.getPromise(dispatcherState);
      set(skillManifestsState(projectId), (skillManifests) => {
        const filtered = skillManifests.filter((manifest) => manifest.id !== id);
        if (filtered.length > 0) {
          newCurrentManifestId = filtered[0].id;
        }
        return filtered;
      });
      dispatcher.updateManifestInBotProjectFile(projectId, newCurrentManifestId);
    }
  );

  const updateSkillManifest = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, content }: SkillManifestFile, projectId: string) => {
      const { set, snapshot } = callbackHelpers;
      const manifests = await snapshot.getPromise(skillManifestsState(projectId));
      const dispatcher = await snapshot.getPromise(dispatcherState);

      if (!manifests.some((manifest) => manifest.id === id)) {
        createSkillManifest(callbackHelpers, { id, content, projectId });
        dispatcher.updateManifestInBotProjectFile(projectId, id);
      }

      set(skillManifestsState(projectId), (skillManifests) =>
        skillManifests.map((manifest) => (manifest.id === id ? { id, content } : manifest))
      );
    }
  );

  const displayManifestModal = useRecoilCallback(({ set }: CallbackInterface) => (id: string) => {
    set(displaySkillManifestState, id);
  });

  const dismissManifestModal = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(displaySkillManifestState, undefined);
  });

  return {
    createSkillManifest,
    removeSkillManifest,
    updateSkillManifest,
    displayManifestModal,
    dismissManifestModal,
    updateSettingsForSkillsWithoutManifest,
  };
};
