// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { PublishResult } from '@bfc/shared';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { dispatcherState, localBotPublishHistorySelector, localBotsDataSelector } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { Notification } from '../../recoilModel/types';
import { getSensitiveProperties } from '../../recoilModel/dispatchers/utils/project';
import {
  getTokenFromCache,
  isShowAuthDialog,
  isGetTokenFromUser,
  setTenantId,
  getTenantIdFromCache,
} from '../../utils/auth';
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
import { Bot, BotStatus } from './type';
import {
  initUpdaterStatus,
  generateBotPropertyData,
  generateBotStatusList,
  deleteNotificationInterval,
} from './publishPageUtils';
import { NewPublishBotList } from './NewPublishBotList';
import { NewPublishProfileList } from './NewPublishProfileList';

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
    rollbackToVersion: rollbackToVersionDispatcher,
    addNotification,
    deleteNotification,
  } = useRecoilValue(dispatcherState);

  const pendingNotificationRef = useRef<Notification>();
  const showNotificationsRef = useRef<Record<string, boolean>>({});

  const [currentBotList, setCurrentBotList] = useState<Bot[]>([]);
  const [publishDialogVisible, setPublishDialogVisiblity] = useState(false);
  const [pullDialogVisible, setPullDialogVisiblity] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [updaterStatus, setUpdaterStatus] = useState<{ [skillId: string]: boolean }>(
    initUpdaterStatus(publishHistoryList)
  );
  const [checkedSkillIds, setCheckedSkillIds] = useState<string[]>([]);

  const { botPropertyData, botList } = useMemo(() => {
    return generateBotPropertyData(botProjectData);
  }, [botProjectData]);

  const botStatusList = useMemo(() => {
    return generateBotStatusList(currentBotList, botPropertyData, publishHistoryList);
  }, [currentBotList, botPropertyData, publishHistoryList]);

  const isPublishPending = useMemo(() => {
    return Object.values(updaterStatus).some(Boolean);
  }, [updaterStatus]);

  const selectedBots = useMemo(() => {
    return currentBotList.filter((bot) => checkedSkillIds.some((id) => bot.id === id));
  }, [checkedSkillIds]);

  const canPull = useMemo(() => {
    return selectedBots.some((bot) => {
      const { publishTypes, publishTargets } = botPropertyData[bot.id];
      const type = publishTypes?.find(
        (t) => t.name === publishTargets?.find((target) => target.name === bot.publishTarget)?.type
      );
      if (type?.features?.pull) {
        return true;
      }
      return false;
    });
  }, [selectedBots]);

  const canPublish =
    checkedSkillIds.length > 0 && !isPublishPending && selectedBots.some((bot) => Boolean(bot.publishTarget));

  // stop polling updater & delete pending notification
  const stopUpdater = async (updater) => {
    updater.stop();

    // Remove pending notification
    const pendingNotification = pendingNotificationRef.current;
    pendingNotification && (await deleteNotification(pendingNotification.id));
    pendingNotificationRef.current = undefined;
  };

  useEffect(() => {
    if (currentBotList.length < botList.length) {
      // init bot status list for the botProjectData is empty array when first mounted
      setCurrentBotList(botList);

      // Start updaters
      botList
        .filter(
          (bot) => !!bot.publishTarget && !pollingUpdaterList.some((u) => u.isSameUpdater(bot.id, bot.publishTarget))
        )
        .forEach((bot) => {
          if (pollingUpdaterList.some((updater) => updater.isSameUpdater(bot.id, bot.publishTarget))) return;
          const updater = new PublishStatusPollingUpdater(bot.id, bot.publishTarget);
          pollingUpdaterList.push(updater);
          updater.start(onReceiveUpdaterPayload);
        });
    }
  }, [botList]);

  useEffect(() => {
    // Clear intervals when unmount
    return () => {
      if (pollingUpdaterList) {
        pollingUpdaterList.forEach((updater) => {
          stopUpdater(updater);
        });
        while (pollingUpdaterList.length) {
          pollingUpdaterList.pop();
        }
      }
    };
  }, []);

  // roll back
  const rollbackToVersion = (version: PublishResult, item: BotStatus) => {
    const setting = botPropertyData[item.id].setting;
    const selectedTarget = item.publishTargets?.find((target) => target.name === item.publishTarget);
    if (setting) {
      const sensitiveSettings = getSensitiveProperties(setting);
      rollbackToVersionDispatcher(item.id, selectedTarget, version.id, sensitiveSettings);
    }
  };

  const onRollbackToVersion = (selectedVersion: PublishResult, item: BotStatus) => {
    item.publishTarget && item.publishTargets && rollbackToVersion(selectedVersion, item);
  };

  const updatePublishStatus = async (data) => {
    const { botProjectId, targetName, apiResponse } = data;
    const publishTargets = botPropertyData[botProjectId].publishTargets;
    if (!publishTargets) return;

    const selectedTarget = publishTargets.find((target) => target.name === targetName);
    // set recoil value
    await getPublishStatusV2(botProjectId, selectedTarget, apiResponse);
  };

  const changeNotificationStatus = async (data) => {
    const { botProjectId, targetName, apiResponse } = data;
    const updater = pollingUpdaterList.find((i) => i.isSameUpdater(botProjectId, targetName));
    const updatedBot = botList.find((bot) => bot.id === botProjectId);
    if (!updatedBot || !updater) return;
    const responseData = apiResponse.data;

    if (responseData.status !== ApiStatus.Publishing) {
      stopUpdater(updater);

      // Show result notifications
      const displayedNotifications = showNotificationsRef.current;
      if (displayedNotifications[botProjectId]) {
        const resultNotification = createNotification(
          getPublishedNotificationCardProps({ ...updatedBot, status: responseData.status })
        );
        addNotification(resultNotification);
        setTimeout(() => {
          deleteNotification(resultNotification.id);
          showNotificationsRef.current = { ...displayedNotifications, [botProjectId]: false };
        }, deleteNotificationInterval);
      }
    }
  };

  const updateUpdaterStatus = (payload) => {
    const { botProjectId, targetName, apiResponse } = payload;
    const pending = apiResponse.data.status === ApiStatus.Publishing;
    setUpdaterStatus({
      ...updaterStatus,
      [`${botProjectId}/${targetName}`]: pending,
    });
  };

  // updater onData function
  const onReceiveUpdaterPayload = (payload) => {
    updateUpdaterStatus(payload);
    updatePublishStatus(payload);
    changeNotificationStatus(payload);
  };

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

  const isPublishingToAzure = (items: BotStatus[]) => {
    for (const bot of items) {
      const setting = botPropertyData[bot.id].setting;
      const publishTargets = botPropertyData[bot.id].publishTargets;
      if (!(bot.publishTarget && publishTargets && setting)) {
        continue;
      }
      if (bot.publishTarget && publishTargets) {
        const selectedTarget = publishTargets.find((target) => target.name === bot.publishTarget);
        if (selectedTarget?.type === 'azurePublish' || selectedTarget?.type === 'azureFunctionsPublish') {
          return true;
        }
      }
    }
    return false;
  };

  const publish = async (items: BotStatus[]) => {
    // get token
    let token = '';
    if (isPublishingToAzure(items)) {
      // TODO: this logic needs to be moved into the Azure publish extensions
      if (isGetTokenFromUser()) {
        token = getTokenFromCache('accessToken');
      } else {
        let tenant = getTenantIdFromCache();
        if (!tenant) {
          const tenants = await AuthClient.getTenants();
          tenant = tenants?.[0]?.tenantId;
          setTenantId(tenant);
        }
        token = await AuthClient.getARMTokenForTenant(tenant);
      }
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
        const updater = pollingUpdaterList.find((u) => u.isSameUpdater(botProjectId, bot.publishTarget || ''));
        updater?.restart(onReceiveUpdaterPayload);
      }
    }
  };

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
      newUpdater.start(onReceiveUpdaterPayload);
      pollingUpdaterList.push(newUpdater);
    }
  };

  const renderPublishBotListItemDetails = (id: string): React.ReactNode => {
    const publishTargets = botPropertyData[id].publishTargets;
    const publishHistory = publishHistoryList[id];
    const items = publishTargets.map((publishTarget) => {
      const profilePublishHistory = publishHistory[publishTarget.name];
      const lastHistoryItem = profilePublishHistory?.length ? profilePublishHistory[0] : undefined;
      return {
        name: publishTarget.name,
        description: publishTarget.type,
        status: lastHistoryItem ? lastHistoryItem.status : '',
        message: lastHistoryItem ? lastHistoryItem.message : '',
        time: lastHistoryItem ? lastHistoryItem.time : '',
        log: lastHistoryItem ? lastHistoryItem.log : '',
      };
    });

    return <NewPublishProfileList items={items} onAddNewProfile={() => {}} />;
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
        <PublishDialog
          items={selectedBots.filter((bot) => !!bot.publishTarget)}
          onDismiss={() => setPublishDialogVisiblity(false)}
          onSubmit={publish}
        />
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
          <Stack>
            <NewPublishBotList items={botStatusList} renderDetails={(id) => renderPublishBotListItemDetails(id)} />
            <BotStatusList
              botPublishHistoryList={publishHistoryList}
              botStatusList={botStatusList}
              checkedIds={checkedSkillIds}
              disableCheckbox={isPublishPending}
              onChangePublishTarget={changePublishTarget}
              onCheck={updateCheckedSkills}
              onManagePublishProfile={manageSkillPublishProfile}
              onRollbackClick={onRollbackToVersion}
            />
          </Stack>
        </div>
      </div>
    </Fragment>
  );
};

export default Publish;
