/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectSpace, BotProjectSpaceSkill } from '@bfc/shared';

import { botNameState, botProjectFileState, locationState, skillManifestsState } from '../atoms';
import { isBotProjectSpaceSelector, rootBotProjectIdSelector } from '../selectors';
import { convertPathToFileProtocol, trimFileProtocol } from '../../utils/fileUtil';

export const botProjectFileDispatcher = () => {
  const addLocalSkillToBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
      const isBotProjectSpace = await snapshot.getPromise(isBotProjectSpaceSelector);
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!isBotProjectSpace || !rootBotProjectId) {
        return;
      }
      const skillLocation = await snapshot.getPromise(locationState(skillId));
      const botName = await snapshot.getPromise(botNameState(skillId));

      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          const skill: BotProjectSpaceSkill = {
            workspace: convertPathToFileProtocol(skillLocation),
            remote: false,
            name: botName,
          };
          draftState.content.skills.push(skill);
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
      const botName = await snapshot.getPromise(botNameState(skillId));

      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          const skill: BotProjectSpaceSkill = {
            manifest: manifestUrl,
            remote: true,
            name: botName,
            endpointName,
          };

          draftState.content.skills.push(skill);
        });
        return result;
      });
    }
  );

  // const removeLocalSkillFromBotProjectFile = useRecoilCallback(
  //   ({ set, snapshot }: CallbackInterface) => async (rootBotProjectId: string, skillId: string) => {
  //     const skillLocation = await snapshot.getPromise(locationState(skillId));
  //     snapshot.getPromise(skillManifestsState(skillId));

  //     set(botProjectFileState(rootBotProjectId), (current: BotProjectSpace) => {
  //       const result = produce(current, (draftState: BotProjectSpace) => {
  //         draftState.skills = draftState.skills.filter(({ workspace }) => {
  //           if (workspace) {
  //             return trimFileProtocol(workspace) !== skillLocation;
  //           }
  //           return true;
  //         });
  //       });
  //       return result;
  //     });
  //   }
  // );

  // const removeRemoteSkillFromBotProjectFile = useRecoilCallback(
  //   ({ set, snapshot }: CallbackInterface) => async (rootBotProjectId: string, projectId: string) => {
  //     const manifestLocation = await snapshot.getPromise(locationState(projectId));
  //     set(botProjectFileState(rootBotProjectId), (current: BotProjectSpace) => {
  //       const result = produce(current, (draftState: BotProjectSpace) => {
  //         draftState.skills = draftState.skills.filter(({ manifest, remote }) => {
  //           if (remote) {
  //             return manifestLocation !== manifest;
  //           }
  //           return true;
  //         });
  //       });
  //       return result;
  //     });
  //   }
  // );

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
    // removeLocalSkillFromBotProjectFile,
    // removeRemoteSkillFromBotProjectFile,
    // renameRootBotInBotProjectFile,
    addRemoteSkillToBotProjectFile,
  };
};
