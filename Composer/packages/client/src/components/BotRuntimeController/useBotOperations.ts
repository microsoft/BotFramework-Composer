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
  const { updateSettingsForSkillsWithoutManifest, resetBotRuntimeError, setBotStatus } = useRecoilValue(
    dispatcherState
  );

  const handleBotStart = async (projectId: string, config: IPublishConfig, botBuildRequired: boolean) => {
    resetBotRuntimeError(projectId);
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
      await botRuntimeOperations?.startBot(projectId);
    }
  };

  const startRootBot = async (skipBuild?: boolean) => {
    setProjectsToTrack([]);
    await updateSettingsForSkillsWithoutManifest();
    const { projectId, configuration, buildRequired, status } = builderEssentials[0];
    if (status !== BotStatus.connected) {
      let isBuildRequired = buildRequired;
      if (skipBuild) {
        isBuildRequired = false;
      }
      handleBotStart(projectId, configuration, isBuildRequired);
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
        const { projectId, configuration, buildRequired } = botBuildConfig;
        await handleBotStart(projectId, configuration, buildRequired);
      }
    }
  };

  const stopAllBots = () => {
    setProjectsToTrack([]);
    builderEssentials.forEach(({ projectId }) => botRuntimeOperations?.stopBot(projectId));
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
        handleBotStart(projectId, botData?.configuration, isBuildRequired);
      }
    }
  };

  const stopSingleBot = (projectId: string) => {
    botRuntimeOperations?.stopBot(projectId);
  };

  return {
    stopAllBots,
    startAllBots,
    startSingleBot,
    stopSingleBot,
  };
}
