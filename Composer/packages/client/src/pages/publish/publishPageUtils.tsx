// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

import { Bot, BotStatus, BotPublishHistory, BotProjectType, BotPropertyType } from './type';

export const deleteNotificationInterval = 5000;

export const generateBotPropertyData = (botProjectData: BotProjectType[]) => {
  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const botPropertyData: BotPropertyType = {};
  const botList: Bot[] = [];
  botProjectData.forEach((bot) => {
    const botProjectId = bot.projectId;
    const publishTargets = bot.setting?.publishTargets || [];
    botPropertyData[botProjectId] = {
      setting: bot.setting,
      publishTargets,
      publishTypes: bot.publishTypes,
    };
    const tmpBot = { id: bot.projectId, name: bot.name, publishTarget: '' };
    if (publishTargets.length > 0) {
      tmpBot.publishTarget = publishTargets[0].name;
    }
    botList.push(tmpBot);
  });
  return { botPropertyData, botList };
};

export const generateBotStatusList = (
  botList: Bot[],
  botPropertyData: BotPropertyType,
  botPublishHistoryList: BotPublishHistory
): BotStatus[] => {
  const bots = botList.map((bot) => {
    const botStatus: BotStatus = Object.assign({}, bot);
    const publishTargets = botPropertyData[bot.id].publishTargets;
    const publishHistory = botPublishHistoryList[bot.id];
    if (publishTargets.length > 0 && botStatus.publishTarget && publishHistory) {
      botStatus.publishTargets = publishTargets;
      if (publishHistory[botStatus.publishTarget] && publishHistory[botStatus.publishTarget].length > 0) {
        const history = publishHistory[botStatus.publishTarget][0];
        botStatus.time = history.time;
        botStatus.comment = history.comment;
        botStatus.message = history.message;
        botStatus.status = history.status;
      }
    }
    return botStatus;
  });
  return bots;
};

// Recover the loading status when switching back to publish page.
export const initUpdaterStatus = (history: BotPublishHistory) => {
  const status = {};
  Object.keys(history).forEach((skillId) => {
    const targetHistory = history[skillId];
    Object.keys(targetHistory).forEach((targetName) => {
      const historyData = targetHistory[targetName];
      if (Array.isArray(historyData) && historyData[0] && historyData[0].status === ApiStatus.Publishing) {
        status[`${skillId}/${targetName}`] = true;
      }
    });
  });

  return status;
};
