/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import settingsStorage from '../../utils/dialogSettingStorage';
import { dispatcherState, botProjectSpaceSelector } from '../../recoilModel';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';

import { PublishDialog } from './publishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { IStatus } from './publishStatusList';
import { BotStatusList, IBotStatus } from './botStatusList';

const Publish: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const { projectId = '' } = props;
  const botProjectsMeta = useRecoilValue(botProjectSpaceSelector);

  const [selectedBots, setSelectedBots] = useState<IBotStatus[]>([]);

  // fill Settings, status, publishType, publish target for bot from botProjectMeta
  const botSettingsList: { [key: string]: any }[] = [];
  const botStatusList: IBotStatus[] = [];
  const botPublishTypesList: { [key: string]: any }[] = [];
  const [botPublishHistoryList, setBotPublishHistoryList] = useState<{ [key: string]: any }[]>([]);
  const publishHistoyList: { [key: string]: any }[] = [];
  botProjectsMeta
    .filter((bot) => bot.isRemote === false)
    .forEach((bot) => {
      const botProjectId = bot.projectId;
      botSettingsList.push({
        projectId: botProjectId,
        settings: bot.settings,
      });
      botPublishTypesList.push({
        projectId: botProjectId,
        publishTypes: bot.publishTypes,
      });
      const publishHistory = bot.publishHistory;
      publishHistoyList.push({
        projectId: botProjectId,
        publishHistory,
      });
      const publishTargets = bot.settings ? (bot.settings.publishTargets as any[]) : [];
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
      botStatusList.push(botStatus);
    });

  const {
    getPublishTargetTypes,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    rollbackToVersion: rollbackToVersionDispatcher,
  } = useRecoilValue(dispatcherState);

  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);

  // items to show in the list
  const [selectedVersion, setSelectedVersion] = useState<IStatus | null>(null);

  const isRollbackSupported = (targetName, version, publishTargets, projectId): boolean => {
    const target = publishTargets.find((publishTarget) => publishTarget.name === targetName);
    if (version.id && version.status === 200 && target) {
      const publishTypes = botPublishTypesList.find((type) => type.projectId === projectId);
      const type = publishTypes?.filter((t) => t.name === target.type)[0];
      if (type?.features?.rollback) {
        return true;
      }
    }
    return false;
  };

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'element',
      align: 'left',
      element: (
        <ActionButton
          data-testid="publishPage-Toolbar-Publish"
          disabled={selectedBots.length > 0 ? false : true}
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
  ];

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
      // init selected status
      setSelectedVersion(null);
    }
  }, [projectId]);

  useEffect(() => {
    if (publishHistoyList.length > 0) {
      setBotPublishHistoryList(publishHistoyList);
    }
  }, [botProjectsMeta]);

  const rollbackToVersion = (version, item) => {
    const sensitiveSettings = settingsStorage.get(item.id);
    rollbackToVersionDispatcher(projectId, item.publishTarget, version.id, sensitiveSettings);
  };

  const onRollbackToVersion = (selectedVersion, item) => {
    item.publishTarget &&
      isRollbackSupported(item.publishTarget, selectedVersion, item.publishTargets, item.id) &&
      rollbackToVersion(selectedVersion, item);
  };
  const onShowLog = (selectedVersion) => {
    setSelectedVersion(selectedVersion);
    setShowLog(true);
  };
  const updatePublishHistory = (publishHistories, botStatus) => {
    const newPublishHistory = botPublishHistoryList.map((botPublishHistory) => {
      if (botPublishHistory.projectId === botStatus) {
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
    // publish to remote
    if (items.length > 0) {
      for (const bot of items) {
        if (bot.publishTarget && bot.publishTargets) {
          const selectedTarget = bot.publishTargets.find((target) => target.name === bot.publishTarget);
          const projectId = bot.id;
          const settings = botSettingsList.find((botSettings) => botSettings.projectId === bot.id)?.settings || {};
          if (settings.publishTargets) {
            if (settings.qna && Object(settings.qna).subscriptionKey) {
              await setQnASettings(projectId, Object(settings.qna).subscriptionKey);
            }
            const sensitiveSettings = settingsStorage.get(projectId);
            await publishToTarget(projectId, selectedTarget, { comment: bot.comment }, sensitiveSettings);

            // update the target with a lastPublished date
            const updatedPublishTargets = settings.publishTargets.map((profile) => {
              if (profile.name === selectedTarget) {
                return {
                  ...profile,
                  lastPublished: new Date(),
                };
              } else {
                return profile;
              }
            });

            await setPublishTargets(updatedPublishTargets, projectId);
          }
        }
      }
    }
  };

  return (
    <Fragment>
      {!publishDialogHidden && (
        <PublishDialog items={selectedBots} onDismiss={() => setPublishDialogHidden(true)} onSubmit={publish} />
      )}
      {showLog && <LogDialog version={selectedVersion} onDismiss={() => setShowLog(false)} />}
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Publish Your bots')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <BotStatusList
              botPublishHistoryList={botPublishHistoryList}
              items={botStatusList}
              updatePublishHistory={updatePublishHistory}
              updateSelectedBots={updateSelectedBots}
              onLogClick={onShowLog}
              onRollbackClick={onRollbackToVersion}
            />
          </Fragment>
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
      minWidth={450}
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
