// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { DialogSetting, PublishTarget } from '@bfc/shared';

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
import { PublishStatusPollingUpdater } from '../../utils/publishStatusPollingUpdater';
import { IBotPublishTarget, IBotPublishType, IBotSetting } from './type';

const deleteNotificationInterval = 5000;

// CR: Data model. What is stable data? What is frequently changed data? Manage them separately rather than repeating them.
const generateComputedData = (botProjectData) => {
  const botSettingList: IBotSetting[] = [];
  const botPublishTypesList: IBotPublishType[] = [];
  const botPublishTargetList: IBotPublishTarget[] = [];
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
    botPublishTargetList.push({
      id: bot.id,
      name: bot.name,
      publishTarget: publishTargets[0].name || '',
    });
  });
  return { botSettingList, botPublishTypesList, botPublishTargetList };
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
  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const { botSettingList, botPublishTypesList, botPublishTargetList } = useMemo(() => {
    return generateComputedData(botProjectData);
  }, [botProjectData]);

  const [selectedBots, setSelectedBots] = useState<IBotPublishTarget[]>([]);
  const publishDisabled = useMemo(() => {
    selectedBots.some((bot) => {
      const publishTargets = botSettingList.find((settingMap) => settingMap.projectId === botId)?.setting
        .publishTargets;
      if (!(bot.publishTarget && publishTargets)) {
        return false;
      }
      const selectedTarget = publishTargets.find((target) => target.name === bot.publishTarget);
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
    });
  }, [selectedBots]);

  const [showNotifications, setShowNotifications] = useState<Record<string, boolean>>({});

  const [currentBotPublishTargetList, setCurrentBotPublishTargetList] = useState<IBotPublishTarget[]>(
    botPublishTargetList
  );

  // create updater
  const initUpdaterList = botPublishTargetList
    .filter((bot) => !!bot.publishTarget)
    .map((bot) => {
      const updater = new PublishStatusPollingUpdater(bot.id, bot.publishTarget);
      updater.start((data) => updateData(data));
      return updater;
    });

  // updater onData function
  const updateData = (data) => {
    const { botId, targetName, apiResponse } = data;
    const responseData = apiResponse?.data;

    const updaterList = updaterListRef.current;
    const updatedBot = botStatusList.find((bot) => bot.id === botId);
    const updater = updaterList.find((i) => i.getProperty().botId === botId);
    const publishTargets = botSettingList.find((settingMap) => settingMap.projectId === botId)?.setting.publishTargets;
    if (!updatedBot || !publishTargets || !updater) return;
    const selectedTarget = publishTargets.find((target) => (target.name = targetName));
    getPublishStatus(botId, selectedTarget, apiResponse);
    if (responseData.status === 200 || responseData.status === 500) {
      updater.stop();
      // show result notifications
      if (showNotifications[botId]) {
        pendingNotification && deleteNotification(pendingNotification.id);
        const resultNotification = createNotification(getPublishedNotificationCardProps(updatedBot));
        addNotification(resultNotification);
        setShowNotifications({ ...showNotifications, [botId]: false });
        setTimeout(() => {
          deleteNotification(resultNotification.id);
        }, deleteNotificationInterval);
      }
    }
  };
  const updaterListRef = useRef<PublishStatusPollingUpdater[]>(initUpdaterList);

  // CR: Define the data type outside.
  const [botPublishHistoryList, setBotPublishHistoryList] = useState<
    { projectId: string; publishHistory: { [key: string]: IStatus[] } }[]
  >(publishHistoryList);
  // CR: preferred naming convention - xxxVisible, setXXXVisibility
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

  // CR: is it still necessary after merging the bot-project feature?
  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  // CR: this hook is anti-pattern. Use computed value.
  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    setBotPublishHistoryList(publishHistoryList);
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

  // CR: Listen on 'botProjectData' but consumes 'statusList'?
  // CR: Can be moved to polling logic.
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
      const updaterList = updaterListRef.current;
      if (updaterList) {
        updaterList.forEach((updater) => {
          updater.stop();
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

  // CR: Too complicated member function. Needs refactor.
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

  // CR: Changes a property but causes whole array re-mapped. Consider managing `selectedPublishTarget` separately.
  //     selectedPublishTarget: Map<BotId, TargetId>;
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
          {/* CR: define a better data model for BotStatusList props */}
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
