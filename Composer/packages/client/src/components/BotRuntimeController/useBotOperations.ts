// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPublishConfig } from '@bfc/shared';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { BotStatus } from '../../constants';
import { dispatcherState, rootBotProjectIdSelector } from '../../recoilModel';
import { botRuntimeOperationsSelector, buildConfigurationSelector } from '../../recoilModel/selectors';

import { useStartedRuntimesTracker } from './useStartedRuntimesTracker';

export function useBotOperations() {
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const botRuntimeOperations = useRecoilValue(botRuntimeOperationsSelector);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const [trackedProjectIds, setProjectsToTrack] = useState<string[]>([]);
  const { updateSettingsForSkillsWithoutManifest, resetBotRuntimeLog, setBotStatus } = useRecoilValue(dispatcherState);

  const handleBotStart = async (
    projectId: string,
    config: IPublishConfig,
    sensitiveSettings,
    botBuildRequired: boolean
  ) => {
    resetBotRuntimeLog(projectId);
    setBotStatus(projectId, BotStatus.pending);
    if (botBuildRequired) {
      // Default recognizer
      const matchedBuilder = builderEssentials.find(
        ({ projectId: currentProjectId }) => projectId === currentProjectId
      );
      if (matchedBuilder?.dialogs) {
        await botRuntimeOperations?.buildWithDefaultRecognizer(projectId, {
          dialogs: matchedBuilder.dialogs,
          config,
        });
      }
    } else {
      // Regex recognizer
      await botRuntimeOperations?.startBot(projectId, sensitiveSettings);
    }
  };

  const startRootBot = async (skipBuild?: boolean) => {
    setProjectsToTrack([]);
    await updateSettingsForSkillsWithoutManifest();
    const { projectId, configuration, buildRequired, status, sensitiveSettings } = builderEssentials[0];
    if (status !== BotStatus.connected) {
      let isBuildRequired = buildRequired;
      if (skipBuild) {
        isBuildRequired = false;
      }
      handleBotStart(projectId, configuration, sensitiveSettings, isBuildRequired);
    }
  };

  // Custom hook to make sure root bot is started after all skills have been started.
  useStartedRuntimesTracker(() => {
    startRootBot();
  }, trackedProjectIds);

  const startAllBots = async () => {
    builderEssentials.forEach((bot) => {
      setBotStatus(bot.projectId, BotStatus.queued);
    });
    const [, ...skillsBots] = builderEssentials;
    if (skillsBots.length === 0) {
      startRootBot();
      return;
    }

    const trackProjects: string[] = skillsBots.map((skillBot) => skillBot.projectId);
    setProjectsToTrack(trackProjects);
    for (const botBuildConfig of skillsBots) {
      if (botBuildConfig.status !== BotStatus.connected) {
        const { projectId, configuration, buildRequired, sensitiveSettings } = botBuildConfig;
        await handleBotStart(projectId, configuration, sensitiveSettings, buildRequired);
      }
    }
  };

  const stopAllBots = async (): Promise<void> => {
    setProjectsToTrack([]);
    for (const projectBuilder of builderEssentials) {
      await botRuntimeOperations?.stopBot(projectBuilder.projectId);
    }
  };

  const startSingleBot = (projectId: string, skipBuild: boolean | undefined = undefined) => {
    if (projectId === rootBotId) {
      startRootBot(skipBuild);
    } else {
      const botData = builderEssentials.find((builder) => builder.projectId === projectId);
      if (botData) {
        let isBuildRequired = botData?.buildRequired;
        if (skipBuild) {
          isBuildRequired = false;
        }
        handleBotStart(projectId, botData?.configuration, botData.sensitiveSettings, isBuildRequired);
      }
    }
  };

  const stopSingleBot = async (projectId: string) => {
    await botRuntimeOperations?.stopBot(projectId);
  };

  return {
    stopAllBots,
    startAllBots,
    startSingleBot,
    stopSingleBot,
  };
}
