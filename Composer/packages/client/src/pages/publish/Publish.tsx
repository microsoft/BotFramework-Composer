/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import settingsStorage from '../../utils/dialogSettingStorage';
import {
  dispatcherState,
  settingsState,
  botDisplayNameState,
  publishTypesState,
  publishHistoryState,
  botProjectSpaceSelector,
} from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';

import { PublishDialog } from './publishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { CreatePublishTarget } from './createPublishTarget';
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
  const botPublishHistoryList: { [key: string]: any }[] = [];

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
        publishTypes: useRecoilValue(publishTypesState(botProjectId)),
      });
      const publishHistory = useRecoilValue(publishHistoryState(botProjectId));
      botPublishHistoryList.push({
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
  const publishTypes = useRecoilValue(publishTypesState(projectId));

  const {
    getPublishStatus,
    getPublishTargetTypes,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    rollbackToVersion: rollbackToVersionDispatcher,
  } = useRecoilValue(dispatcherState);

  const [addDialogHidden, setAddDialogHidden] = useState(true);

  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);

  // items to show in the list
  const [selectedVersion, setSelectedVersion] = useState<IStatus | null>(null);
  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  const isRollbackSupported = useMemo(
    () => (target, version): boolean => {
      if (version.id && version.status === 200 && target) {
        const type = publishTypes?.filter((t) => t.name === target.type)[0];
        if (type?.features?.rollback) {
          return true;
        }
      }
      return false;
    },
    [projectId, publishTypes]
  );

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
              fill="#0078D4"
            />
          </svg>
          <span css={{ marginLeft: '8px' }}>{formatMessage('Publish selected bots')}</span>
        </ActionButton>
      ),
    },
  ];

  const onSelectTarget = useCallback(
    (targetName) => {
      const url = `/bot/${projectId}/publish/${targetName}`;
      navigateTo(url);
    },
    [projectId]
  );

  const getUpdatedStatus = (target) => {
    if (target) {
      // TODO: this should use a backoff mechanism to not overload the server with requests
      // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
      setTimeout(async () => {
        getPublishStatus(projectId, target);
      }, 10000);
    }
  };

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
      // init selected status
      setSelectedVersion(null);
    }
  }, [projectId]);

  const rollbackToVersion = useMemo(
    () => async (version) => {
      const sensitiveSettings = settingsStorage.get(projectId);
      await rollbackToVersionDispatcher(projectId, selectedTarget, version.id, sensitiveSettings);
    },
    [projectId, selectedTarget]
  );

  const onRollbackToVersion = (selectedVersion) => {
    selectedTarget && isRollbackSupported(selectedTarget, selectedVersion) && rollbackToVersion(selectedVersion);
  };
  const onShowLog = (selectedVersion) => {
    setSelectedVersion(selectedVersion);
    setShowLog(true);
  };
  const updateSelectedBots = (selectedBots) => {
    const bots: IBotStatus[] = [];
    selectedBots.forEach((bot) => {
      bots.push({
        id: bot.id,
        name: bot.name,
        publishTarget: bot.publishTarget,
      });
    });
    setSelectedBots(bots);
  };
  const publish = useMemo(
    () => async (comment) => {
      // publish to remote
      if (selectedTarget && settings.publishTargets) {
        if (settings.qna && Object(settings.qna).subscriptionKey) {
          await setQnASettings(projectId, Object(settings.qna).subscriptionKey);
        }
        const sensitiveSettings = settingsStorage.get(projectId);
        await publishToTarget(projectId, selectedTarget, { comment: comment }, sensitiveSettings);

        // update the target with a lastPublished date
        const updatedPublishTargets = settings.publishTargets.map((profile) => {
          if (profile.name === selectedTarget.name) {
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
    },
    [projectId, selectedTarget, settings.publishTargets]
  );

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
