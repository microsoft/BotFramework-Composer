/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectSpaceSkill, convertAbsolutePathToFileProtocol } from '@bfc/shared';

import { botNameIdentifierState, botProjectFileState, locationState } from '../atoms';
import { rootBotProjectIdSelector } from '../selectors';

export const botProjectFileDispatcher = () => {
  const addLocalSkillToBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!rootBotProjectId) {
        return;
      }
      const skillLocation = await snapshot.getPromise(locationState(skillId));
      const botName = await snapshot.getPromise(botNameIdentifierState(skillId));

      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          const skill: BotProjectSpaceSkill = {
            workspace: convertAbsolutePathToFileProtocol(skillLocation),
            remote: false,
          };
          draftState.content.skills[botName] = skill;
        });
        return result;
      });
    }
  );

  const addRemoteSkillToBotProjectFile = useRecoilCallback(
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

  const removeSkillFromBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
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
    }
  );

  return {
    addLocalSkillToBotProjectFile,
    removeSkillFromBotProjectFile,
    addRemoteSkillToBotProjectFile,
  };
};
