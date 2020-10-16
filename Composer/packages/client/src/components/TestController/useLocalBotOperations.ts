// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPublishConfig } from '@bfc/shared';
import { css } from '@emotion/core';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { botRuntimeOperationsSelector, buildConfigurationSelector } from '../../recoilModel';

import { useBotStatusTracker } from './useBotStatusTracker';

export function useBotOperations(onAllBotsStarted?: (started: boolean) => void) {
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const botRuntimeOperations = useRecoilValue(botRuntimeOperationsSelector);
  const [trackedProjectIds, setProjectsToTrack] = useState<string[]>([]);

  const handleBotStart = async (projectId: string, config: IPublishConfig, botBuildRequired: boolean) => {
    if (botBuildRequired) {
      // Default recognizer
      await botRuntimeOperations?.buildWithDefaultRecognizer(projectId, config);
    } else {
      // Regex recognizer
      await botRuntimeOperations?.startBot(projectId, config);
    }
  };

  const startRootBot = () => {
    setProjectsToTrack([]);
    const rootBot = builderEssentials[0];
    const { projectId, configuration, buildRequired } = rootBot;
    handleBotStart(projectId, configuration, buildRequired);
  };

  // Custom hook to make sure root bot is started after all skills have been started.
  useBotStatusTracker(() => {
    startRootBot();
  }, trackedProjectIds);

  const startAllBots = async () => {
    const [rootBot, ...skillsBots] = builderEssentials;
    const trackProjects: string[] = skillsBots.map((skillBot) => skillBot.projectId);
    setProjectsToTrack(trackProjects);
    for (const botBuildConfig of skillsBots) {
      const { projectId, configuration, buildRequired } = botBuildConfig;
      await handleBotStart(projectId, configuration, buildRequired);
    }
    if (onAllBotsStarted) {
      onAllBotsStarted(true);
    }
  };

  const stopAllBots = () => {
    setProjectsToTrack([]);
    builderEssentials.forEach(({ projectId }) => botRuntimeOperations?.stopBot(projectId));
    if (onAllBotsStarted) {
      onAllBotsStarted(false);
    }
  };

  const startSingleBot = (projectId: string) => {
    const skillData = builderEssentials.find((builder) => builder.projectId === projectId);
    if (skillData) {
      handleBotStart(projectId, skillData?.configuration, skillData?.buildRequired);
    }
  };

  return {
    stopAllBots,
    startAllBots,
    startSingleBot,
  };
}
