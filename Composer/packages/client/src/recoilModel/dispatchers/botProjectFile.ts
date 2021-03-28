/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';
import { BotProjectFile, BotProjectSpaceSkill, Skill } from '@bfc/shared';

import { botNameIdentifierState, botProjectFileState, dispatcherState, locationState, settingsState } from '../atoms';
import { rootBotProjectIdSelector } from '../selectors';

import { setRootBotSettingState } from './setting';

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

  const removeSkill = useRecoilCallback((callbackHelpers: CallbackInterface) => async (skillId: string) => {
    const { set, snapshot } = callbackHelpers;
    const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
    if (!rootBotProjectId) {
      return;
    }

    const botNameIdentifier = await snapshot.getPromise(botNameIdentifierState(skillId));
    set(botProjectFileState(rootBotProjectId), (current) => {
      const result = produce(current, (draftState) => {
        delete draftState.content.skills[botNameIdentifier];
      });
      return result;
    });

    const rootBotSettings = await snapshot.getPromise(settingsState(rootBotProjectId));
    if (rootBotSettings.skill) {
      const updatedSettings = produce(rootBotSettings, (draftState) => {
        if (draftState.skill?.[botNameIdentifier]) {
          delete draftState.skill[botNameIdentifier];
        }
      });
      setRootBotSettingState(callbackHelpers, rootBotProjectId, updatedSettings);
    }
  });

  const updateManifest = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillProjectId: string, manifestId?: string) => {
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!rootBotProjectId) {
        return;
      }

      const skillNameIdentifier = await snapshot.getPromise(botNameIdentifierState(skillProjectId));
      set(botProjectFileState(rootBotProjectId), (current: BotProjectFile) => {
        const result = produce(current, (draftState) => {
          if (!manifestId) {
            delete draftState.content.skills[skillNameIdentifier].manifest;
          } else {
            draftState.content.skills[skillNameIdentifier] = {
              ...draftState.content.skills[skillNameIdentifier],
              manifest: manifestId,
            };
          }
        });
        return result;
      });
    }
  );

  const updateSkillsData = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      skillNameIdentifier: string,
      skillsData: Skill,
      selectedEndpointIndex: number
    ) => {
      const { set, snapshot } = callbackHelpers;
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!rootBotProjectId) {
        return;
      }

      const settings = await snapshot.getPromise(settingsState(rootBotProjectId));
      const dispatcher = await snapshot.getPromise(dispatcherState);

      let msAppId = '',
        endpointUrl = '',
        endpointName = '';

      if (selectedEndpointIndex !== -1 && skillsData.manifest) {
        const data = skillsData.manifest?.endpoints[selectedEndpointIndex];
        msAppId = data.msAppId;
        endpointUrl = data.endpointUrl;
        endpointName = data.name;

        set(botProjectFileState(rootBotProjectId), (current) => {
          const result = produce(current, (draftState) => {
            draftState.content.skills[skillNameIdentifier].endpointName = endpointName;
          });
          return result;
        });
      } else {
        set(botProjectFileState(rootBotProjectId), (current) => {
          const result = produce(current, (draftState) => {
            delete draftState.content.skills[skillNameIdentifier].endpointName;
          });
          return result;
        });
      }
      if (settings.skill) {
        dispatcher.setSettings(
          rootBotProjectId,
          produce(settings, (draftSettings) => {
            draftSettings.skill = {
              ...settings.skill,
              [skillNameIdentifier]: {
                endpointUrl,
                msAppId,
              },
            };
          })
        );
      }
    }
  );

  const updateEndpointName = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillNameIdentifier: string, endpointName: string) => {
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (!rootBotProjectId) {
        return;
      }

      set(botProjectFileState(rootBotProjectId), (current) => {
        const result = produce(current, (draftState) => {
          draftState.content.skills[skillNameIdentifier].endpointName = endpointName;
        });
        return result;
      });
    }
  );

  return {
    addLocalSkillToBotProjectFile: addLocalSkill,
    removeSkillFromBotProjectFile: removeSkill,
    addRemoteSkillToBotProjectFile: addRemoteSkill,
    updateSkillsDataInBotProjectFile: updateSkillsData,
    updateManifestInBotProjectFile: updateManifest,
    updateEndpointNameInBotProjectFile: updateEndpointName,
  };
};
