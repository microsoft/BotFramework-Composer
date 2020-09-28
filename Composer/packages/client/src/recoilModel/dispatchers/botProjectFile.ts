/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectSpace, BotProjectSpaceSkill } from '@bfc/shared';

import {
  botNameState,
  botProjectFileState,
  botProjectIdsState,
  locationState,
  projectMetaDataState,
  skillManifestsState,
} from '../atoms';
import { isBotProjectSpaceSelector } from '../selectors';
import { convertPathToFileProtocol, trimFileProtocol } from '../../utils/fileUtil';

export const botProjectFileDispatcher = () => {
  const addSkillToBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillId: string) => {
      const isBotProjectSpace = await snapshot.getPromise(isBotProjectSpaceSelector);
      if (!isBotProjectSpace) {
        return;
      }
      const projectIds = await snapshot.getPromise(botProjectIdsState);
      const rootBotProjectId = projectIds[0];
      const { isRemote } = await snapshot.getPromise(projectMetaDataState(skillId));

      const skillLocation = await snapshot.getPromise(locationState(skillId));
      const botName = await snapshot.getPromise(botNameState(skillId));
      const manifests: { id: string; content: string; lastModified: string }[] = await snapshot.getPromise(
        skillManifestsState(skillId)
      );
      // TODO:// We would support only 1 manifest per skill. It will always be the first manifest. We would need UI in future to set the default manifest file
      const currentManifest = manifests[0];
      set(botProjectFileState(rootBotProjectId), (current: BotProjectSpace) => {
        const result = produce(current, (draftState: BotProjectSpace) => {
          const skill: BotProjectSpaceSkill = {
            workspace: convertPathToFileProtocol(skillLocation),
            remote: isRemote,
            name: botName,
          };
          if (currentManifest) {
            skill.manifest = currentManifest.id;
          }
          draftState.skills.push(skill);
        });
        return result;
      });
    }
  );

  const removeLocalSkillFromBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (rootBotProjectId: string, skillId: string) => {
      const skillLocation = await snapshot.getPromise(locationState(skillId));
      snapshot.getPromise(skillManifestsState(skillId));

      set(botProjectFileState(rootBotProjectId), (current: BotProjectSpace) => {
        const result = produce(current, (draftState: BotProjectSpace) => {
          draftState.skills = draftState.skills.filter(({ workspace }) => {
            if (workspace) {
              return trimFileProtocol(workspace) !== skillLocation;
            }
            return true;
          });
        });
        return result;
      });
    }
  );

  const removeRemoteSkillFromBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (rootBotProjectId: string, projectId: string) => {
      const manifestLocation = await snapshot.getPromise(locationState(projectId));
      set(botProjectFileState(rootBotProjectId), (current: BotProjectSpace) => {
        const result = produce(current, (draftState: BotProjectSpace) => {
          draftState.skills = draftState.skills.filter(({ manifest, remote }) => {
            if (remote) {
              return manifestLocation !== manifest;
            }
            return true;
          });
        });
        return result;
      });
    }
  );

  const renameRootBotInBotProjectFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (projectId: string) => {
      const location = await snapshot.getPromise(locationState(projectId));
      const botname = await snapshot.getPromise(botNameState(projectId));
      set(botProjectFileState(projectId), (current: BotProjectSpace) => {
        const result = produce(current, (draftState: BotProjectSpace) => {
          draftState.workspace = convertPathToFileProtocol(location);
          draftState.name = botname;
        });
        return result;
      });
    }
  );

  return {
    addSkillToBotProjectFile,
    removeLocalSkillFromBotProjectFile,
    removeRemoteSkillFromBotProjectFile,
    renameRootBotInBotProjectFile,
  };
};
