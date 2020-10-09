// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SkillManifestFile } from '@bfc/shared';

import { dispatcherState } from '../DispatcherWrapper';

import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
} from './../atoms/botState';

export const skillDispatcher = () => {
  const createSkillManifest = async (callbackHelpers: CallbackInterface, { id, content, projectId }) => {
    const { set, snapshot } = callbackHelpers;
    let manifestForBotProjectFile = undefined;
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
      let newCurrentManifestId: string | undefined = undefined;
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
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: SkillManifestFile, projectId: string) => {
      const manifests = await snapshot.getPromise(skillManifestsState(projectId));
      const dispatcher = await snapshot.getPromise(dispatcherState);
      if (!manifests.some((manifest) => manifest.id === id)) {
        createSkillManifest({ set, snapshot }, { id, content, projectId });
        dispatcher.updateManifestInBotProjectFile(projectId, id);
        return;
      }

      set(skillManifestsState(projectId), (skillManifests) =>
        skillManifests.map((manifest) => (manifest.id === id ? { id, content } : manifest))
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
    createSkillManifest,
    removeSkillManifest,
    updateSkillManifest,
    addSkillDialogBegin,
    addSkillDialogCancel,
    displayManifestModal,
    dismissManifestModal,
  };
};
