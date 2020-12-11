// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { DialogSetting, PublishTarget } from '@bfc/shared';
import isEqual from 'lodash/isEqual';

import { dispatcherState, localBotPublishHistorySelector, localBotsDataSelector } from '../../recoilModel';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { Notification, PublishType } from '../../recoilModel/types';
import { getSensitiveProperties } from '../../recoilModel/dispatchers/utils/project';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { PublishDialog } from './PublishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { IStatus } from './PublishStatusList';
import { BotStatusList, IBotStatus } from './BotStatusList';
import { getPendingNotificationCardProps, getPublishedNotificationCardProps } from './Notifications';
import { PullDialog } from './pullDialog';
import { PublishToolbar } from './PublishToolbar';

const publishStatusInterval = 10000;
const deleteNotificationInterval = 5000;
const intervals: { [key: string]: number } = {};

const generateComputedData = (botProjectData, publishHistoryList, currentBotPublishTargetList) => {
  const botSettingList: { projectId: string; setting: DialogSetting }[] = [];
  const statusList: IBotStatus[] = [];
  const botPublishTypesList: { projectId: string; publishTypes: PublishType[] }[] = [];
  const publishTargetsList: { projectId: string; publishTargets: PublishTarget[] }[] = [];
  botProjectData.forEach((bot) => {
    const botProjectId = bot.projectId;
    botSettingList.push({
      projectId: botProjectId,
      setting: bot.setting,
    });
    botPublishTypesList.push({
      projectId: botProjectId,
      publishTypes: bot.publishTypes,
    });
    const publishTargets = bot.setting ? bot.setting.publishTargets || [] : [];
    publishTargetsList.push({
      projectId: botProjectId,
      publishTargets,
    });
    const botStatus: IBotStatus = {
      id: botProjectId,
      name: bot.name,
      publishTargets: [],
    };
    const publishHistory = publishHistoryList.find((item) => item.projectId === bot.projectId)?.publishHistory;
    if (publishTargets.length > 0) {
      const currentPublishTarget =
        currentBotPublishTargetList &&
        currentBotPublishTargetList.find((targetMap) => targetMap.projectId === botStatus.id);
      botStatus.publishTarget = (currentPublishTarget && currentPublishTarget.publishTarget
        ? currentPublishTarget.publishTarget
        : publishTargets[0].name) as string;
      botStatus.publishTargets = publishTargets;
      if (publishHistory[botStatus.publishTarget] && publishHistory[botStatus.publishTarget].length > 0) {
        const history = publishHistory[botStatus.publishTarget][0];
        botStatus.time = history.time;
        botStatus.comment = history.comment;
        botStatus.message = history.message;
        botStatus.status = history.status;
      }
    }
    statusList.push(botStatus);
  });
  return { botSettingList, statusList, botPublishTypesList };
};
const Publish: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const { projectId = '' } = props;
  const botProjectData = useRecoilValue(localBotsDataSelector);
  const publishHistoryList = useRecoilValue(localBotPublishHistorySelector);
  const {
    getPublishHistory,
    getPublishStatus,
    getPublishTargetTypes,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    addNotification,
    deleteNotification,
  } = useRecoilValue(dispatcherState);

  // TODO: save selectedBotIds instead of whole bot.
  const [selectedBots, setSelectedBots] = useState<IBotStatus[]>([]);
  // TODO: this is a computed boolean.
  const [publishDisabled, setPublishDisabled] = useState(false);
  // TODO: this state is never used?
  const [showNotifications, setShowNotifications] = useState<Record<string, boolean>>({});
  // TODO: Concept not clear. What is this state for?
  const [currentBotPublishTargetList, setCurrentBotPublishTargetList] = useState<
    { projectId: string; publishTarget: string }[]
  >([]);
  // TODO: Define data model.
  // fill Settings, status, publishType, publish target for bot from botProjectMeta, publishHistory
  const { botSettingList, statusList, botPublishTypesList } = useMemo(() => {
    return generateComputedData(botProjectData, publishHistoryList, currentBotPublishTargetList);
  }, [botProjectData, publishHistoryList]);

  const [botStatusList, setBotStatusList] = useState<IBotStatus[]>(statusList);
  // TODO: Define the data type outside.
  const [botPublishHistoryList, setBotPublishHistoryList] = useState<
    { projectId: string; publishHistory: { [key: string]: IStatus[] } }[]
  >(publishHistoryList);
  // TODO: preferred naming convention - xxxVisible, setXXXVisibility
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);
  const [pullDialogHidden, setPullDialogHidden] = useState(true);

  const canPull = useMemo(() => {
    return !!selectedBots.find((bot) => {
      const publishTypes = botPublishTypesList.find((types) => types.projectId === bot.id)?.publishTypes;
      const type = publishTypes?.find(
        (t) => t.name === bot.publishTargets?.find((target) => target.name === bot.publishTarget)?.type
      );
      if (type?.features?.pull) {
        return true;
      }
      return false;
    });
  }, [selectedBots]);
  const canPublish = selectedBots.length > 0 && !publishDisabled;

  const getUpdatedStatus = (target, botProjectId): void => {
    // TODO: this should use a backoff mechanism to not overload the server with requests
    // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
    if (intervals[`${botProjectId}-${target.name}`]) return;
    getPublishStatus(botProjectId, target);
    intervals[`${botProjectId}-${target.name}`] = window.setInterval(async () => {
      getPublishStatus(botProjectId, target);
    }, publishStatusInterval);
  };

  const cleanupInterval = (target, botProjectId): void => {
    if (intervals[`${botProjectId}-${target.name}`]) {
      clearInterval(intervals[`${botProjectId}-${target.name}`]);
      delete intervals[`${botProjectId}-${target.name}`];
    }
  };

  const [pendingNotification, setPendingNotification] = useState<Notification>();
  const [previousBotPublishHistoryList, setPreviousBotPublishHistoryList] = useState(botPublishHistoryList);
  // check history to see if a 202 is found
  useEffect(() => {
    // set publishDisabled
    setPublishDisabled(
      selectedBots.some((bot) => {
        if (!(bot.publishTarget && bot.publishTargets)) {
          return false;
        }
        const selectedTarget = bot.publishTargets.find((target) => target.name === bot.publishTarget);
        const botProjectId = bot.id;
        if (!selectedTarget) return false;
        const botPublishHistory = botPublishHistoryList.find(
          (publishHistory) => publishHistory.projectId === botProjectId
        )?.publishHistory[bot.publishTarget];
        if (!botPublishHistory || botPublishHistory.length === 0) {
          return;
        }
        const latestPublishItem = botPublishHistory[0];
        if (latestPublishItem.status === 202) {
          return true;
        }
      })
    );

    botStatusList.forEach((bot) => {
      if (!(bot.publishTarget && bot.publishTargets)) {
        return;
      }
      const selectedTarget = bot.publishTargets.find((target) => target.name === bot.publishTarget);
      const botProjectId = bot.id;
      if (!selectedTarget) return;
      const botPublishHistory = botPublishHistoryList.find(
        (publishHistory) => publishHistory.projectId === botProjectId
      )?.publishHistory[bot.publishTarget];
      const previousBotPublishHistory = previousBotPublishHistoryList.find(
        (publishHistory) => publishHistory.projectId === botProjectId
      )?.publishHistory[bot.publishTarget];
      if (!botPublishHistory || botPublishHistory.length === 0) {
        return;
      }
      const latestPublishItem = botPublishHistory[0];
      // stop polling if status is 200 or 500
      if (latestPublishItem.status === 202) {
        getUpdatedStatus(selectedTarget, bot.id);
      } else if (latestPublishItem.status === 200 || latestPublishItem.status === 500) {
        cleanupInterval(selectedTarget, bot.id);
        // show result notifications
        if (!isEqual(previousBotPublishHistory, botPublishHistory)) {
          bot.status = latestPublishItem.status;
          if (showNotifications[bot.id]) {
            pendingNotification && deleteNotification(pendingNotification.id);
            const resultNotification = createNotification(getPublishedNotificationCardProps(bot));
            addNotification(resultNotification);
            setShowNotifications({ ...showNotifications, [botProjectId]: false });
            setTimeout(() => {
              deleteNotification(resultNotification.id);
            }, deleteNotificationInterval);
          }
        }
      }
    });
  }, [botPublishHistoryList]);

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    setBotPublishHistoryList(publishHistoryList);
    setBotStatusList(statusList);
    setSelectedBots(
      selectedBots.map((selectedBot) => {
        const bot = statusList.find((botStatus) => botStatus.id === selectedBot.id);
        if (bot) {
          selectedBot = { ...bot, comment: '', message: '', status: undefined, time: '' };
        }
        return selectedBot;
      })
    );
  }, [publishHistoryList]);
  useEffect(() => {
    statusList.forEach((botStatus) => {
      if (!botStatus.publishTargets || !botStatus.publishTarget) {
        return;
      }
      const target = botStatus.publishTargets.find((t) => t.name === botStatus.publishTarget);
      getPublishHistory(botStatus.id, target).then(() => {
        getPublishStatus(botStatus.id, target);
      });
    });
  }, [botProjectData.length]);

  useEffect(() => {
    return () => {
      if (intervals) {
        Object.values(intervals).forEach((value) => {
          window.clearInterval(value);
        });
      }
    };
  }, []);

  const updateBotStatusList = (statusList: IBotStatus[]) => {
    setBotStatusList(statusList);
  };
  const updatePublishHistory = (publishHistories: IStatus[], botStatus: IBotStatus) => {
    const newPublishHistory = botPublishHistoryList.map((botPublishHistory) => {
      if (botPublishHistory.projectId === botStatus.id && botStatus.publishTarget) {
        botPublishHistory.publishHistory = {
          ...botPublishHistory.publishHistory,
          [botStatus.publishTarget]: publishHistories,
        };
      }
      return botPublishHistory;
    });
    setBotPublishHistoryList(newPublishHistory);
  };
  const updateSelectedBots = (selectedBots) => {
    const bots: IBotStatus[] = [];
    selectedBots.forEach((bot) => {
      bots.push({
        id: bot.id,
        name: bot.name,
        publishTarget: bot.publishTarget,
        publishTargets: bot.publishTargets,
      });
    });
    setSelectedBots(bots);
  };
  const publish = async (items: IBotStatus[]) => {
    setPublishDisabled(true);
    setPreviousBotPublishHistoryList(botPublishHistoryList);
    // notifications
    setShowNotifications(
      items.reduce((accumulator, item) => {
        accumulator[item.id] = true;
        return accumulator;
      }, {})
    );
    const notification = createNotification(getPendingNotificationCardProps(items));
    setPendingNotification(notification);
    addNotification(notification);

    // publish to remote
    for (const bot of items) {
      if (bot.publishTarget && bot.publishTargets) {
        const selectedTarget = bot.publishTargets.find((target) => target.name === bot.publishTarget);
        const botProjectId = bot.id;
        const setting = botSettingList.find((botsetting) => botsetting.projectId === bot.id)?.setting;
        if (!(setting && setting.publishTargets)) {
          return;
        }
        setting.qna.subscriptionKey && (await setQnASettings(botProjectId, setting.qna.subscriptionKey));
        const sensitiveSettings = getSensitiveProperties(setting);
        await publishToTarget(botProjectId, selectedTarget, { comment: bot.comment }, sensitiveSettings);

        // update the target with a lastPublished date
        const updatedPublishTargets = setting.publishTargets.map((profile) => {
          if (profile.name === selectedTarget?.name) {
            return {
              ...profile,
              lastPublished: new Date(),
            };
          } else {
            return profile;
          }
        });

        await setPublishTargets(updatedPublishTargets, botProjectId);
        selectedTarget && getUpdatedStatus(selectedTarget, botProjectId);
      }

      setBotStatusList(
        botStatusList.map((bot) => {
          const item = items.find((i) => i.id === bot.id);
          if (item) {
            item.status = 202;
            return item;
          }
          return bot;
        })
      );
    }
  };
  const changePublishTarget = (publishTarget, currentBotStatus) => {
    const target = currentBotStatus.publishTargets.find((t) => t.name === publishTarget);
    if (currentBotPublishTargetList.some((targetMap) => targetMap.projectId === currentBotStatus.id)) {
      setCurrentBotPublishTargetList(
        currentBotPublishTargetList.map((targetMap) => {
          if (targetMap.projectId === currentBotStatus.id) {
            targetMap.publishTarget = publishTarget;
          }
          return targetMap;
        })
      );
    } else {
      setCurrentBotPublishTargetList([
        ...currentBotPublishTargetList,
        { projectId: currentBotStatus.id, publishTarget },
      ]);
    }

    getPublishHistory(currentBotStatus.id, target);
  };

  return (
    <Fragment>
      {!publishDialogHidden && (
        <PublishDialog items={selectedBots} onDismiss={() => setPublishDialogHidden(true)} onSubmit={publish} />
      )}
      {!pullDialogHidden &&
        selectedBots.map((bot, index) => {
          const selectedTarget = bot.publishTargets?.find((target) => target.name === bot.publishTarget);
          const botProjectId = bot.id;
          return (
            <PullDialog
              key={index}
              projectId={botProjectId}
              selectedTarget={selectedTarget}
              onDismiss={() => setPullDialogHidden(true)}
            />
          );
        })}
      <PublishToolbar
        canPublish={canPublish}
        canPull={canPull}
        onPublish={() => {
          setPublishDialogHidden(false);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'publishSelectedBots' });
        }}
        onPull={() => {
          setPullDialogHidden(false);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'pullFromProfile' });
        }}
      />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Publish your bots')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          {/* TODO: define a better data model for BotStatusList props */}
          <BotStatusList
            botPublishHistoryList={botPublishHistoryList}
            botPublishTypesList={botPublishTypesList}
            changePublishTarget={changePublishTarget}
            items={botStatusList}
            projectId={projectId}
            publishDisabled={publishDisabled}
            updateItems={updateBotStatusList}
            updatePublishHistory={updatePublishHistory}
            updateSelectedBots={updateSelectedBots}
            onRollbackClick={() => null}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Publish;
