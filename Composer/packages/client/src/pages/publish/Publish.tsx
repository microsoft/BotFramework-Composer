// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

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
import { navigateTo } from '../../utils/navigation';

import { PublishDialog } from './PublishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { BotStatusList } from './BotStatusList';
import { getPendingNotificationCardProps, getPublishedNotificationCardProps } from './Notifications';
import { PullDialog } from './pullDialog';
import { PublishToolbar } from './PublishToolbar';
import { Bot, BotStatus, BotPublishHistory, BotPropertyType } from './type';

const deleteNotificationInterval = 5000;

const generateComputedData = (botProjectData) => {
  const botPropertyData: BotPropertyType = {};
  const botList: Bot[] = [];
  botProjectData.forEach((bot) => {
    const botProjectId = bot.projectId;
    const publishTargets = bot.setting ? bot.setting.publishTargets || [] : [];
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
  const { botPropertyData, botList } = useMemo(() => {
    return generateComputedData(botProjectData);
  }, [botProjectData]);

  const showNotificationsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    botList
      .filter(
        (bot) => !!bot.publishTarget && !pollingUpdaterList.some((u) => u.isSameUpdater(bot.id, bot.publishTarget))
      )
      .map((bot) => {
        const updater = new PublishStatusPollingUpdater(bot.id, bot.publishTarget);
        updater.start(updateData, changeNotificationStatus);
        pollingUpdaterList.push(updater);
      });
  }, [botList]);

  // updater onData function
  const updateData = async (data) => {
    const { botProjectId, targetName, apiResponse } = data;
    const publishTargets = botPropertyData[botProjectId].publishTargets;
    if (!publishTargets) return;

    const selectedTarget = publishTargets.find((target) => target.name === targetName);
    // set recoil value
    await getPublishStatusV2(botProjectId, selectedTarget, apiResponse);
  };

  // updater onAction function
  const changeNotificationStatus = async (data) => {
    const { botProjectId, targetName, apiResponse } = data;
    const updater = pollingUpdaterList.find((i) => i.isSameUpdater(botProjectId, targetName));
    const updatedBot = botList.find((bot) => bot.id === botProjectId);
    if (!updatedBot || !updater) return;
    const responseData = apiResponse.data;

    if (
      responseData.status === ApiStatus.Success ||
      responseData.status === ApiStatus.Unknown ||
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

  const [botPublishHistoryList, setBotPublishHistoryList] = useState<BotPublishHistory>({});
  const [currentBotList, setCurrentBotList] = useState<Bot[]>([]);
  const [publishDialogVisible, setPublishDialogVisiblity] = useState(false);
  const [pullDialogVisible, setPullDialogVisiblity] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [checkedSkillIds, setCheckedSkillIds] = useState<string[]>([]);
  const selectedBots = useMemo(() => {
    return botList.filter((bot) => checkedSkillIds.some((id) => bot.id === id));
  }, [checkedSkillIds]);

  const botStatusList = useMemo(() => {
    return generateBotStatusList(currentBotList, botPropertyData, botPublishHistoryList);
  }, [currentBotList, botPropertyData, botPublishHistoryList]);

  const publishDisabled = useMemo(() => {
    return botList.some((bot) => {
      const botProjectId = bot.id;

      const botPublishHistory = botPublishHistoryList?.[botProjectId]?.[bot.publishTarget] || [];

      const latestPublishItem = botPublishHistory[0];
      if (latestPublishItem && latestPublishItem.status === ApiStatus.Publishing) {
        return true;
      } else {
        return false;
      }
    });
  }, [botList]);

  const canPull = useMemo(() => {
    return !!selectedBots.find((bot) => {
      const publishTypes = botPropertyData[bot.id].publishTypes;
      const publishTargets = botPropertyData[bot.id].publishTargets;
      const type = publishTypes?.find(
        (t) => t.name === publishTargets?.find((target) => target.name === bot.publishTarget)?.type
      );
      if (type?.features?.pull) {
        return true;
      }
      return false;
    });
  }, [selectedBots]);
  const canPublish = selectedBots.length > 0 && selectedBots.some((bot) => !!bot.publishTarget) && !publishDisabled;

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

  const updateCheckedSkills = (checkedIds: string[]) => {
    setCheckedSkillIds(checkedIds);
  };

  const manageSkillPublishProfile = (skillId: string) => {
    const url =
      skillId === projectId
        ? `/bot/${projectId}/botProjectsSettings/#addNewPublishProfile`
        : `bot/${projectId}/skill/${skillId}/botProjectsSettings/#addNewPublishProfile`;
    navigateTo(url);
  };

  const publish = async (items: BotStatus[]) => {
    // get token
    let token = '';
    if (isGetTokenFromUser()) {
      token = getTokenFromCache('accessToken');
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
      const setting = botPropertyData[bot.id].setting;
      const publishTargets = botPropertyData[bot.id].publishTargets;
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
        const updater = pollingUpdaterList.find((u) => u.isSameUpdater(botProjectId, bot.publishTarget));
        updater && updater.restart(updateData, changeNotificationStatus);
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
    if (!pollingUpdaterList.some((u) => u.isSameUpdater(currentBotStatus.id, publishTarget))) {
      const newUpdater = new PublishStatusPollingUpdater(currentBotStatus.id, publishTarget);
      newUpdater.start(updateData, changeNotificationStatus);
      pollingUpdaterList.push(newUpdater);
    }
  };

  return (
    <Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={() => setPublishDialogVisiblity(true)}
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
          const publishTargets = botPropertyData[bot.id].publishTargets;
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
          if (isShowAuthDialog(false)) {
            setShowAuthDialog(true);
          } else {
            setPublishDialogVisiblity(true);
          }
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
          <BotStatusList
            botPublishHistoryList={botPublishHistoryList}
            botStatusList={botStatusList}
            changePublishTarget={changePublishTarget}
            checkedIds={checkedSkillIds}
            managePublishProfile={manageSkillPublishProfile}
            publishDisabled={publishDisabled}
            onCheck={updateCheckedSkills}
            onRollbackClick={() => null}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Publish;

const generateBotStatusList = (
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
