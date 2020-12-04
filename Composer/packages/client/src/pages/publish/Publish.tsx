// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DialogSetting, PublishTarget } from '@bfc/shared';
import isEqual from 'lodash/isEqual';

import { dispatcherState, localBotsDataSelector } from '../../recoilModel';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { Notification, PublishType } from '../../recoilModel/types';
import { getSensitiveProperties } from '../../recoilModel/dispatchers/utils/project';

import { PublishDialog } from './PublishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { IStatus } from './PublishStatusList';
import { BotStatusList, IBotStatus } from './BotStatusList';
import { getPendingNotificationCardProps, getPublishedNotificationCardProps } from './Notifications';
import { PullDialog } from './pullDialog';

const publishStatusInterval = 10000;
const Publish: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const { projectId = '' } = props;
  const botProjectData = useRecoilValue(localBotsDataSelector);
  const {
    getPublishHistory,
    getPublishStatus,
    getPublishTargetTypes,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    rollbackToVersion: rollbackToVersionDispatcher,
    addNotification,
    deleteNotification,
  } = useRecoilValue(dispatcherState);

  const [selectedBots, setSelectedBots] = useState<IBotStatus[]>([]);
  const [publishDisabled, setPublishDisabled] = useState(false);

  const [showNotifications, setShowNotifications] = useState<Record<string, boolean>>({});
  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const botSettingList: { projectId: string; setting: DialogSetting }[] = [];
  const statusList: IBotStatus[] = [];
  const botPublishTypesList: { projectId: string; publishTypes: PublishType[] }[] = [];
  const publishHistoryList: { projectId: string; publishHistory: { [key: string]: IStatus[] } }[] = [];
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
    const publishHistory = bot.publishHistory;
    publishHistoryList.push({
      projectId: botProjectId,
      publishHistory,
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
    if (publishTargets.length > 0) {
      botStatus.publishTarget = publishTargets[0].name as string;
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
  const [botStatusList, setBotStatusList] = useState<IBotStatus[]>(statusList);
  const [botPublishHistoryList, setBotPublishHistoryList] = useState<
    { projectId: string; publishHistory: { [key: string]: IStatus[] } }[]
  >(publishHistoryList);
  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);
  const [pullDialogHidden, setPullDialogHidden] = useState(true);

  // items to show in the list
  const [selectedVersion, setSelectedVersion] = useState<IStatus | null>(null);

  const isPullSupported = useMemo(() => {
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

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'element',
      align: 'left',
      element: (
        <ActionButton
          data-testid="publishPage-Toolbar-Publish"
          disabled={publishDisabled || selectedBots.length === 0}
          onClick={() => setPublishDialogHidden(false)}
        >
          <svg fill="none" height="15" viewBox="0 0 16 15" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 4.28906V15H5V0H11.7109L16 4.28906ZM12 4H14.2891L12 1.71094V4ZM15 14V5H11V1H6V14H15ZM0 5H4V6H0V5ZM1 7H4V8H1V7ZM2 9H4V10H2V9Z"
              fill={selectedBots.length > 0 && !publishDisabled ? '#0078D4' : 'rgb(161, 159, 157)'}
            />
          </svg>
          <span css={{ marginLeft: '8px' }}>{formatMessage('Publish selected bots')}</span>
        </ActionButton>
      ),
    },
    {
      type: 'action',
      text: formatMessage('Pull from selected profile'),
      buttonProps: {
        iconProps: {
          iconName: 'CloudDownload',
        },
        onClick: () => setPullDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-Toolbar-Pull',
      disabled: !isPullSupported,
    },
  ];
  const [statusIntervals, setStatusIntervals] = useState<{ [key: string]: NodeJS.Timeout }[]>([]);
  const getUpdatedStatus = (target, botProjectId): NodeJS.Timeout => {
    // TODO: this should use a backoff mechanism to not overload the server with requests
    // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
    return setInterval(async () => {
      getPublishStatus(botProjectId, target);
    }, publishStatusInterval);
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

    selectedBots.forEach((bot) => {
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
      if (latestPublishItem.status === 200 || latestPublishItem.status === 500) {
        const interval = statusIntervals.find((i) => i[bot.id]);
        if (interval) {
          clearInterval(interval[bot.id]);
          setStatusIntervals(statusIntervals.filter((i) => !i[botProjectId]));
        }
        // show result notifications
        if (!isEqual(previousBotPublishHistory, botPublishHistory)) {
          bot.status = latestPublishItem.status;
          if (showNotifications[bot.id]) {
            pendingNotification && deleteNotification(pendingNotification.id);
            addNotification(createNotification(getPublishedNotificationCardProps(bot)));
            setShowNotifications({ ...showNotifications, [botProjectId]: false });
          }
        }
      }
      setBotStatusList(
        botStatusList.map((item) => {
          if (item.id === botProjectId) {
            item.status = latestPublishItem.status;
            item.comment = latestPublishItem.comment;
            item.message = latestPublishItem.message;
            item.time = latestPublishItem.time;
          }
          return item;
        })
      );
    });
  }, [botPublishHistoryList, selectedBots]);

  useEffect(() => {
    const newBotStatusItems: IBotStatus[] = [];
    botPublishHistoryList.forEach((publishHistoryList) => {
      let botStatus = botStatusList.find((status) => status.id === publishHistoryList.projectId);
      if (!botStatus || !botStatus.publishTarget) return;
      const botPublishHistory = publishHistoryList?.publishHistory[botStatus.publishTarget];
      if (botPublishHistory && botPublishHistory.length > 0) {
        botStatus.status = botPublishHistory[0].status;
        botStatus.comment = botPublishHistory[0].comment;
        botStatus.message = botPublishHistory[0].message;
        botStatus.time = botPublishHistory[0].time;
      } else {
        botStatus = { ...botStatus, status: undefined, comment: '', message: '', time: '' };
      }
      newBotStatusItems.push(botStatus);
    });

    setBotStatusList(newBotStatusItems);
    setSelectedBots(
      selectedBots.map((selectedBot) => {
        const bot = newBotStatusItems.find((botStatus) => botStatus.id === selectedBot.id);
        if (bot) {
          selectedBot = { ...bot, comment: '', message: '', status: undefined, time: '' };
        }
        return selectedBot;
      })
    );
  }, [botPublishHistoryList]);
  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
      // init selected status
      setSelectedVersion(null);
    }
  }, [projectId]);

  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    const statuses: IBotStatus[] = [];
    for (let i = 0; i < statusList.length; i++) {
      let status: IBotStatus;
      if (!botStatusList[i]) {
        status = statusList[i];
      } else if (
        botStatusList[i].publishTarget === statusList[i].publishTarget &&
        !isEqual(botStatusList[i], statusList[i])
      ) {
        status = statusList[i];
      } else {
        status = botStatusList[i];
      }
      statuses.push(status);
    }
    setBotStatusList(statuses);
    if (!isEqual(botStatusList, statusList)) {
      setBotPublishHistoryList(publishHistoryList);
    }
  }, [botProjectData]);
  useEffect(() => {
    statusList.forEach((botStatus) => {
      if (!botStatus.publishTargets || !botStatus.publishTarget) {
        return;
      }
      const target = botStatus.publishTargets.find((t) => t.name === botStatus.publishTarget);
      getPublishHistory(botStatus.id, target);
    });
  }, [botProjectData.length]);

  const rollbackToVersion = (version: IStatus, item: IBotStatus) => {
    const setting = botSettingList.find((botSetting) => botSetting.projectId === item.id)?.setting;
    const selectedTarget = item.publishTargets?.find((target) => target.name === item.publishTarget);
    if (setting) {
      const sensitiveSettings = getSensitiveProperties(setting);
      rollbackToVersionDispatcher(item.id, selectedTarget, version.id, sensitiveSettings);
    }
  };

  const onRollbackToVersion = (selectedVersion: IStatus, item: IBotStatus) => {
    item.publishTarget && item.publishTargets && rollbackToVersion(selectedVersion, item);
  };
  const onShowLog = (selectedVersion) => {
    setSelectedVersion(selectedVersion);
    setShowLog(true);
  };
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
    const intervals: { [key: string]: NodeJS.Timeout }[] = [];
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
        intervals.push({ [botProjectId]: getUpdatedStatus(selectedTarget, botProjectId) });
      }
      setStatusIntervals(intervals);
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
    setBotStatusList(
      botStatusList.map((status) => {
        if (status.id === currentBotStatus.id) {
          status.publishTarget = publishTarget;
        }
        return status;
      })
    );
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
      {showLog && <LogDialog version={selectedVersion} onDismiss={() => setShowLog(false)} />}
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Publish your bots')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
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
            onLogClick={onShowLog}
            onRollbackClick={onRollbackToVersion}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Publish;
const LogDialog = (props) => {
  const logDialogProps = {
    title: 'Publish Log',
  };
  return (
    <Dialog
      dialogContentProps={logDialogProps}
      hidden={false}
      minWidth={700}
      modalProps={{ isBlocking: true }}
      onDismiss={props.onDismiss}
    >
      <TextField
        multiline
        placeholder="Log Output"
        style={{ minHeight: 300 }}
        value={props && props.version ? props.version.log : ''}
      />
    </Dialog>
  );
};
