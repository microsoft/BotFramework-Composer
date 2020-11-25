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

  const [showNotifications, setShowNotifications] = useState<Record<string, boolean>>({});
  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const botSettingList: { projectId: string; setting: DialogSetting }[] = [];
  const statusList: IBotStatus[] = [];
  const botPublishTypesList: { projectId: string; publishTypes: PublishType[] }[] = [];
  const publishHistoryList: { projectId: string; publishHistory: { [key: string]: IStatus[] } }[] = [];
  const publishTargetsList: { projectId: string; publishTargets: PublishTarget[] }[] = [];
  const [hasGetPublishHistory, setHasGetPublishHistory] = useState<boolean>(false);
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
          disabled={selectedBots.length === 0}
          onClick={() => setPublishDialogHidden(false)}
        >
          <svg fill="none" height="15" viewBox="0 0 16 15" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 4.28906V15H5V0H11.7109L16 4.28906ZM12 4H14.2891L12 1.71094V4ZM15 14V5H11V1H6V14H15ZM0 5H4V6H0V5ZM1 7H4V8H1V7ZM2 9H4V10H2V9Z"
              fill={selectedBots.length > 0 ? '#0078D4' : 'rgb(161, 159, 157)'}
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
  const getUpdatedStatus = (target, botProjectId) => {
    if (target) {
      // TODO: this should use a backoff mechanism to not overload the server with requests
      // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
      setTimeout(async () => {
        getPublishStatus(botProjectId, target);
      }, publishStatusInterval);
    }
  };

  const [pendingNotification, setPendingNotification] = useState<Notification>();
  // check history to see if a 202 is found
  useEffect(() => {
    // most recent item is a 202, which means we should poll for updates...
    selectedBots.forEach((bot) => {
      if (bot.publishTarget && bot.publishTargets) {
        const selectedTarget = bot.publishTargets.find((target) => target.name === bot.publishTarget);
        const botProjectId = bot.id;
        if (selectedTarget) {
          const botPublishHistory = botPublishHistoryList.find(
            (publishHistory) => publishHistory.projectId === botProjectId
          )?.publishHistory[bot.publishTarget];
          if (botPublishHistory && botPublishHistory.length > 0) {
            if (botPublishHistory[0].status === 202) {
              getUpdatedStatus(selectedTarget, botProjectId);
            } else if (botPublishHistory[0].status === 200 || botPublishHistory[0].status === 500) {
              bot.status = botPublishHistory[0].status;
              if (showNotifications[bot.id]) {
                pendingNotification && deleteNotification(pendingNotification.id);
                addNotification(createNotification(getPublishedNotificationCardProps(bot)));
                setShowNotifications({ ...showNotifications, [botProjectId]: false });
              }
            } else if (selectedTarget && selectedTarget.lastPublished && botPublishHistory.length === 0) {
              // if the history is EMPTY, but we think we've done a publish based on lastPublished timestamp,
              // we still poll for the results IF we see that a publish has happened previously
              getPublishStatus(botProjectId, selectedTarget);
            }
            setBotStatusList(
              botStatusList.map((item) => {
                if (item.id === botProjectId) {
                  item.status = botPublishHistory[0].status;
                  item.comment = botPublishHistory[0].comment;
                  item.message = botPublishHistory[0].message;
                  item.time = botPublishHistory[0].time;
                }
                return item;
              })
            );
          }
        }
      }
    });
  }, [botPublishHistoryList, selectedBots]);

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
      // init selected status
      setSelectedVersion(null);
    }
  }, [projectId]);

  useEffect(() => {
    // init publishHistoryList
    if (Object.keys(publishHistoryList).length > 0) {
      setBotPublishHistoryList(publishHistoryList);
    }
    // get the latest publishHistory when publish bots.
    if (!hasGetPublishHistory) {
      publishTargetsList.forEach((botTargets) => {
        botTargets.publishTargets.forEach((target) => {
          getPublishHistory(botTargets.projectId, target);
        });
      });
      setHasGetPublishHistory(true);
    }
  }, [botProjectData]);
  useEffect(() => {
    // init bot status list for the botProjectData is empty array when first mounted
    setBotStatusList(statusList);
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
        botPublishHistory.publishHistory[botStatus.publishTarget] = publishHistories;
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
        if (setting && setting.publishTargets) {
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
        }
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
    const newBotStatusItems = botStatusList.map((botStatus) => {
      if (currentBotStatus.id === botStatus.id) {
        botStatus.publishTarget = publishTarget;
        const botPublishHistory = botPublishHistoryList.find(
          (publishHistory) => publishHistory.projectId === botStatus.id
        )?.publishHistory[publishTarget];
        if (botPublishHistory && botPublishHistory.length > 0) {
          botStatus.status = botPublishHistory[0].status;
          botStatus.comment = botPublishHistory[0].comment;
          botStatus.message = botPublishHistory[0].message;
          botStatus.time = botPublishHistory[0].time;
        } else {
          botStatus = { ...botStatus, status: undefined, comment: '', message: '', time: '' };
        }
      }
      return botStatus;
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
