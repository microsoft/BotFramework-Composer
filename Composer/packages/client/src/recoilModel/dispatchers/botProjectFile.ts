/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectSpaceSkill } from '@bfc/shared';

import { botNameIdentifierState, botProjectFileState, locationState } from '../atoms';
import { isBotProjectSpaceSelector, rootBotProjectIdSelector } from '../selectors';
import { convertPathToFileProtocol } from '../../utils/fileUtil';

export const botProjectFileDispatcher = () => {
  const addLocalSkillToBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
      const isBotProjectSpace = await snapshot.getPromise(isBotProjectSpaceSelector);
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!isBotProjectSpace || !rootBotProjectId) {
        return;
      }
      const skillLocation = await snapshot.getPromise(locationState(skillId));
      const botName = await snapshot.getPromise(botNameIdentifierState(skillId));

      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          const skill: BotProjectSpaceSkill = {
            workspace: convertPathToFileProtocol(skillLocation),
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
      const isBotProjectSpace = await snapshot.getPromise(isBotProjectSpaceSelector);
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!isBotProjectSpace || !rootBotProjectId) {
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
      const isBotProjectSpace = await snapshot.getPromise(isBotProjectSpaceSelector);
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!isBotProjectSpace || !rootBotProjectId) {
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

  // const renameRootBotInBotProjectFile = useRecoilCallback(
  //   ({ set, snapshot }: CallbackInterface) => async (projectId: string) => {
  //     const location = await snapshot.getPromise(locationState(projectId));
  //     const botname = await snapshot.getPromise(botNameState(projectId));
  //     set(botProjectFileState(projectId), (current: BotProjectSpace) => {
  //       const result = produce(current, (draftState: BotProjectSpace) => {
  //         draftState.workspace = convertPathToFileProtocol(location);
  //         draftState.name = botname;
  //       });
  //       return result;
  //     });
  //   }
  // );

  return {
    addLocalSkillToBotProjectFile,
    removeSkillFromBotProjectFile,
    addRemoteSkillToBotProjectFile,
  };
};
