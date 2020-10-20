/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectSpaceSkill } from '@bfc/shared';

import { botNameIdentifierState, botProjectFileState, locationState } from '../atoms';
import { rootBotProjectIdSelector } from '../selectors';

export const botProjectFileDispatcher = () => {
  const addLocalSkill = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
    const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
    if (!rootBotProjectId) {
      return;
    }
    const rootBotLocation = await snapshot.getPromise(locationState(rootBotProjectId));
    const skillLocation = await snapshot.getPromise(locationState(skillId));
    const botName = await snapshot.getPromise(botNameIdentifierState(skillId));

    set(botProjectFileState(rootBotProjectId), (current) => {
      const result = produce(current, (draftState) => {
        const relativePath = path.relative(rootBotLocation, skillLocation);
        const skill: BotProjectSpaceSkill = {
          workspace: relativePath,
          remote: false,
        };
        draftState.content.skills[botName] = skill;
      });
      return result;
    });
  });

  const addRemoteSkill = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string, manifestUrl: string, endpointName: string) => {
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!rootBotProjectId) {
        return;
      }
      const botName = await snapshot.getPromise(botNameIdentifierState(skillId));
      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          const skill: BotProjectSpaceSkill = {
            manifest: manifestUrl,
            remote: true,
            endpointName,
          };

          draftState.content.skills[botName] = skill;
        });
        return result;
      });
    }
  );

  const removeSkill = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
    const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
    if (!rootBotProjectId) {
      return;
    }

    const botName = await snapshot.getPromise(botNameIdentifierState(skillId));
    set(botProjectFileState(rootBotProjectId), (current) => {
      const result = produce(current, (draftState) => {
        delete draftState.content.skills[botName];
      });
      return result;
    });
  });

  return {
    addLocalSkillToBotProjectFile: addLocalSkill,
    removeSkillFromBotProjectFile: removeSkill,
    addRemoteSkillToBotProjectFile: addRemoteSkill,
  };
};
