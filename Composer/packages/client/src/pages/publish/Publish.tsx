// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { PublishResult } from '@bfc/shared';

import { dispatcherState, localBotPublishHistorySelector, localBotsDataSelector } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { Notification } from '../../recoilModel/types';
import { getSensitiveProperties } from '../../recoilModel/dispatchers/utils/project';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../utils/auth';
import { AuthClient } from '../../utils/authClient';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { ApiStatus, PublishStatusPollingUpdater, pollingUpdaterList } from '../../utils/publishStatusPollingUpdater';

import { PublishDialog } from './PublishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { BotStatusList } from './BotStatusList';
import { getPendingNotificationCardProps, getPublishedNotificationCardProps } from './Notifications';
import { PullDialog } from './pullDialog';
import { PublishToolbar } from './PublishToolbar';
import { IBot, IBotStatus, IBotPublishHistory, IBotPublishType, IBotPublishTargets, IBotSetting } from './type';

const deleteNotificationInterval = 5000;

// CR: Data model. What is stable data? What is frequently changed data? Manage them separately rather than repeating them.
const generateComputedData = (botProjectData) => {
  const botSettingList: IBotSetting[] = [];
  const botPublishTargetsList: IBotPublishTargets[] = [];
  const botPublishTypesList: IBotPublishType[] = [];
  const botList: IBot[] = [];
  botProjectData.forEach((bot) => {
    const botProjectId = bot.projectId;
    const publishTargets = bot.setting ? bot.setting.publishTargets || [] : [];
    botSettingList.push({
      projectId: botProjectId,
      setting: bot.setting,
    });
    botPublishTargetsList.push({
      projectId: botProjectId,
      publishTargets,
    });
    botPublishTypesList.push({
      projectId: botProjectId,
      publishTypes: bot.publishTypes,
    });
    const tmpBot = { id: bot.projectId, name: bot.name, publishTarget: '' };
    if (publishTargets.length > 0) {
      tmpBot.publishTarget = publishTargets[0].name;
    }
    botList.push(tmpBot);
  });
  return { botSettingList, botPublishTargetsList, botPublishTypesList, botList };
};

const Publish: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const { projectId = '' } = props;
  const botProjectData = useRecoilValue(localBotsDataSelector);
  const publishHistoryList = useRecoilValue(localBotPublishHistorySelector);
  const {
    getPublishHistory,
    getPublishStatusV2,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    addNotification,
    deleteNotification,
  } = useRecoilValue(dispatcherState);
  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const { botSettingList, botPublishTargetsList, botPublishTypesList, botList } = useMemo(() => {
    return generateComputedData(botProjectData);
  }, [botProjectData]);

  const showNotificationsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    botList
      .filter((bot) => !!bot.publishTarget && !pollingUpdaterList.some((u) => u.beEqual(bot.id, bot.publishTarget)))
      .map((bot) => {
        const updater = new PublishStatusPollingUpdater({ botProjectId: bot.id, targetName: bot.publishTarget });
        updater.start(updateData);
        pollingUpdaterList.push(updater);
      });
  }, [botList]);
  // updater onData function
  const updateData = async (data) => {
    const { botProjectId, targetName, apiResponse } = data;
    const updater = pollingUpdaterList.find((i) => i.beEqual(botProjectId, targetName));
    const updatedBot = botList.find((bot) => bot.id === botProjectId);
    const publishTargets = botPublishTargetsList.find((targetsMap) => targetsMap.projectId === botProjectId)
      ?.publishTargets;
    if (!updatedBot || !publishTargets || !updater) return;
    const responseData = apiResponse.data;

    const selectedTarget = publishTargets.find((target) => target.name === targetName);
    await getPublishStatusV2(botProjectId, selectedTarget, apiResponse);
    if (
      responseData.status === ApiStatus.Success ||
      responseData.status === ApiStatus.Unknow ||
      responseData.status === ApiStatus.Failed
    ) {
      // show result notifications
      const pendingNotification = pendingNotificationRef.current;
      pendingNotification && (await deleteNotification(pendingNotification.id));
      pendingNotificationRef.current = undefined;
      const showNotifications = showNotificationsRef.current;
      if (showNotifications[botProjectId]) {
        const resultNotification = createNotification(getPublishedNotificationCardProps(updatedBot));
        addNotification(resultNotification);
        setTimeout(() => {
          deleteNotification(resultNotification.id);
          showNotificationsRef.current = { ...showNotifications, [botProjectId]: false };
        }, deleteNotificationInterval);
      }
      updater.stop();
    }
  };

  const [botPublishHistoryList, setBotPublishHistoryList] = useState<IBotPublishHistory[]>(publishHistoryList);
  const [currentBotList, setCurrentBotList] = useState<IBot[]>(botList);
  const [publishDialogVisible, setPublishDialogVisiblity] = useState(false);
  const [pullDialogVisible, setPullDialogVisiblity] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [selectedBots, setSelectedBots] = useState<IBot[]>([]);
  const publishDisabled = useMemo(() => {
    return selectedBots.some((bot) => {
      const publishTargets = botPublishTargetsList.find((targetsMap) => targetsMap.projectId === bot.id)
        ?.publishTargets;
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

  const canPull = useMemo(() => {
    return !!selectedBots.find((bot) => {
      const publishTypes = botPublishTypesList.find((types) => types.projectId === bot.id)?.publishTypes;
      const publishTargets = botPublishTargetsList.find((targetsMap) => targetsMap.projectId === bot.id)
        ?.publishTargets;
      const type = publishTypes?.find(
        (t) => t.name === publishTargets?.find((target) => target.name === bot.publishTarget)?.type
      );
      if (type?.features?.pull) {
        return true;
      }
      return false;
    });
  }, [selectedBots]);
  const canPublish = selectedBots.length > 0 && !publishDisabled;

  const pendingNotificationRef = useRef<Notification>();

  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    setBotPublishHistoryList(publishHistoryList);
  }, [publishHistoryList]);

  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    setCurrentBotList(botList);
  }, [botList]);

  useEffect(() => {
    return () => {
      if (pollingUpdaterList) {
        pollingUpdaterList.forEach((updater) => {
          updater.stop();
        });
      }
    };
  }, []);
  const updateBotStatusList = (statusList: IBotStatus[]) => {
    setCurrentBotList(
      statusList.map((bot) => ({ id: bot.id, name: bot.name, publishTarget: bot.publishTarget } as IBot))
    );
  };
  const updatePublishHistory = (publishHistories: PublishResult[], botStatus: IBotStatus) => {
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
    const bots: IBot[] = [];
    selectedBots.forEach((bot) => {
      bots.push({
        id: bot.id,
        name: bot.name,
        publishTarget: bot.publishTarget,
      });
    });
    setSelectedBots(bots);
  };

  const publish = async (items: IBotStatus[]) => {
    // get token
    let token = '';
    if (isGetTokenFromUser()) {
      token = getTokenFromCache('accessToken');
      console.log(token);
    } else {
      token = await AuthClient.getAccessToken(armScopes);
    }

    setPublishDialogVisiblity(false);
    // notifications
    showNotificationsRef.current = items.reduce((accumulator, item) => {
      accumulator[item.id] = true;
      return accumulator;
    }, {});
    const notification = createNotification(getPendingNotificationCardProps(items));
    pendingNotificationRef.current = notification;
    addNotification(notification);

    // publish to remote
    for (const bot of items) {
      const setting = botSettingList.find((settingMap) => settingMap.projectId === bot.id)?.setting;
      const publishTargets = botPublishTargetsList.find((targetsMap) => targetsMap.projectId === bot.id)
        ?.publishTargets;
      if (!(bot.publishTarget && publishTargets && setting)) {
        return;
      }
      if (bot.publishTarget && publishTargets) {
        const selectedTarget = publishTargets.find((target) => target.name === bot.publishTarget);
        const botProjectId = bot.id;
        setting.qna.subscriptionKey && (await setQnASettings(botProjectId, setting.qna.subscriptionKey));
        const sensitiveSettings = getSensitiveProperties(setting);
        await publishToTarget(botProjectId, selectedTarget, { comment: bot.comment }, sensitiveSettings, token);

        // update the target with a lastPublished date
        const updatedPublishTargets = publishTargets.map((profile) => {
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
        const updater = pollingUpdaterList.find((u) => u.beEqual(botProjectId, bot.publishTarget));
        updater && updater.restart(updateData);
      }
    }
  };

  // selectedPublishTarget: Map<botProjectId, TargetId>;
  const changePublishTarget = (publishTarget, currentBotStatus) => {
    const target = currentBotStatus.publishTargets.find((t) => t.name === publishTarget);
    if (currentBotList.some((targetMap) => targetMap.id === currentBotStatus.id)) {
      setCurrentBotList(
        currentBotList.map((targetMap) => {
          if (targetMap.id === currentBotStatus.id) {
            targetMap.publishTarget = publishTarget;
          }
          return targetMap;
        })
      );
    } else {
      setCurrentBotList([...currentBotList, { id: currentBotStatus.id, name: currentBotStatus.name, publishTarget }]);
    }

    getPublishHistory(currentBotStatus.id, target);

    // Add new updater
    if (!pollingUpdaterList.some((u) => u.beEqual(currentBotStatus.id, publishTarget))) {
      const newUpdater = new PublishStatusPollingUpdater({
        botProjectId: currentBotStatus.id,
        targetName: publishTarget,
      });
      newUpdater.start(updateData);
      pollingUpdaterList.push(newUpdater);
    }
  };

  return (
    <Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={() => setPublishDialogHidden(false)}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      {publishDialogVisible && (
        <PublishDialog items={selectedBots} onDismiss={() => setPublishDialogVisiblity(false)} onSubmit={publish} />
      )}
      {pullDialogVisible &&
        selectedBots.map((bot, index) => {
          const publishTargets = botPublishTargetsList.find((settingMap) => settingMap.projectId === bot.id)
            ?.publishTargets;
          const selectedTarget = publishTargets?.find((target) => target.name === bot.publishTarget);
          const botProjectId = bot.id;
          return (
            <PullDialog
              key={index}
              projectId={botProjectId}
              selectedTarget={selectedTarget}
              onDismiss={() => setPullDialogVisiblity(false)}
            />
          );
        })}
      <PublishToolbar
        canPublish={canPublish}
        canPull={canPull}
        onPublish={() => {
          setPublishDialogVisiblity(true);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'publishSelectedBots' });
        }}
        onPull={() => {
          setPullDialogVisiblity(true);
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
            botList={currentBotList}
            botPublishHistoryList={botPublishHistoryList}
            botPublishTargetsList={botPublishTargetsList}
            botPublishTypesList={botPublishTypesList}
            changePublishTarget={changePublishTarget}
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
