// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { PublishResult, PublishTarget } from '@bfc/shared';

import { dispatcherState, localBotPublishHistorySelector, localBotsDataSelector } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { Notification } from '../../recoilModel/types';
import { getSensitiveProperties } from '../../recoilModel/dispatchers/utils/project';
import {
  getTokenFromCache,
  isShowAuthDialog,
  userShouldProvideTokens,
  setTenantId,
  getTenantIdFromCache,
} from '../../utils/auth';
// import { vaultScopes } from '../../constants';
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

const Publish: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const { projectId = '' } = props;

  const botProjectData = useRecoilValue(localBotsDataSelector);
  const publishHistoryList = useRecoilValue(localBotPublishHistorySelector);
  const {
    getPublishHistory,
    getPublishStatusV2,
    getPublishTargetTypes,
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

  // The publishTypes are loaded from the server and put into the publishTypesState per project
  // The botProjectSpaceSelector maps the publishTypes to the project bots.
  // The localBotsDataSelector uses botProjectSpaceSelector
  // The botPropertyData uses localBotsDataSelector
  // When the botPropertyData is used (like in the canPull method), the publishTypes must be loaded for the current project.
  // Otherwise the botPropertyData publishTypes will always be empty and this component won't function properly.
  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  const canPull = useMemo(() => {
    return selectedBots.some((bot) => {
      const { publishTypes, publishTargets } = botPropertyData[bot.id];
      const botPublishTarget = publishTargets?.find((target) => target.name === bot.publishTarget);
      const type = publishTypes?.find((t) => t.name === botPublishTarget?.type);
      return type?.features?.pull;
    });
  }, [selectedBots, botPropertyData]);

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
    if (!apiResponse) {
      stopUpdater(updater);
      return;
    }
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
    const pending = apiResponse && apiResponse.data.status === ApiStatus.Publishing;
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

  const isPublishingToAzure = (target?: PublishTarget) => {
    return target?.type === 'azurePublish' || target?.type === 'azureFunctionsPublish';
  };

  const publish = async (items: BotStatus[]) => {
    const tenantTokenMap = new Map<string, string>();
    // get token
    const getTokenForTarget = async (target?: PublishTarget) => {
      let token = '';
      if (target && isPublishingToAzure(target)) {
        const { tenantId } = JSON.parse(target.configuration);

        if (userShouldProvideTokens()) {
          token = getTokenFromCache('accessToken');
        } else if (tenantId) {
          token = tenantTokenMap.get(tenantId) ?? (await AuthClient.getARMTokenForTenant(tenantId));
          tenantTokenMap.set(tenantId, token);
        } else {
          // old publish profile without tenant id
          let tenant = getTenantIdFromCache();
          let tenants;
          if (!tenant) {
            try {
              tenants = await AuthClient.getTenants();

              tenant = tenants?.[0]?.tenantId;
              setTenantId(tenant);

              token = tenantTokenMap.get(tenant) ?? (await AuthClient.getARMTokenForTenant(tenant));
            } catch (err) {
              let notification;
              if (err?.message.includes('does not exist in tenant') && tenants.length > 1) {
                notification = createNotification({
                  type: 'error',
                  title: formatMessage('Unsupported publishing profile'),
                  description: formatMessage(
                    "This publishing profile ({ profileName }) is no longer supported. You are a member of multiple Azure tenants and the profile needs to have a tenant id associated with it. You can either edit the profile by adding the `tenantId` property to it's configuration or create a new one.",
                    { profileName: target.name }
                  ),
                });
              } else {
                notification = createNotification({
                  type: 'error',
                  title: formatMessage('Authentication Error'),
                  description: formatMessage('There was an error accessing your Azure account: {errorMsg}', {
                    errorMsg: err.message,
                  }),
                });
              }
              addNotification(notification);
            }
          }
        }
      }

      return token;
    };

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
      const selectedTarget = publishTargets.find((target) => target.name === bot.publishTarget);
      if (selectedTarget) {
        const botProjectId = bot.id;
        setting.qna.subscriptionKey && (await setQnASettings(botProjectId, setting.qna.subscriptionKey));
        const sensitiveSettings = getSensitiveProperties(setting);
        const token = await getTokenForTarget(selectedTarget);
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
        </div>
      </div>
    </Fragment>
  );
};

export default Publish;
