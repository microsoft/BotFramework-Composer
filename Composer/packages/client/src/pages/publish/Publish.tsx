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
  const selectedTargetName = props.targetName;

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
  const [selectedTarget, setSelectedTarget] = useState<PublishTarget | undefined>();
  const settings = useRecoilValue(settingsState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const publishTypes = useRecoilValue(publishTypesState(projectId));
  const publishHistory = useRecoilValue(publishHistoryState(projectId));

  const {
    getPublishStatus,
    getPublishTargetTypes,
    getPublishHistory,
    setPublishTargets,
    publishToTarget,
    setQnASettings,
    rollbackToVersion: rollbackToVersionDispatcher,
  } = useRecoilValue(dispatcherState);

  const [addDialogHidden, setAddDialogHidden] = useState(true);

  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);

  // items to show in the list
  const [thisPublishHistory, setThisPublishHistory] = useState<IStatus[]>([]);
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
      element: (
        <ActionButton
          data-testid="publishPage-Toolbar-Publish"
          disabled={selectedTargetName !== 'all' ? false : true}
          onClick={() => setPublishDialogHidden(false)}
        >
          <svg fill="none" height="15" viewBox="0 0 16 15" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 4.28906V15H5V0H11.7109L16 4.28906ZM12 4H14.2891L12 1.71094V4ZM15 14V5H11V1H6V14H15ZM0 5H4V6H0V5ZM1 7H4V8H1V7ZM2 9H4V10H2V9Z"
              fill="#0078D4"
            />
          </svg>
          {formatMessage('Publish selected bots')}
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
    // if url was wrong, redirect to all profiles page
    const activeDialog = settings.publishTargets?.find(({ name }) => name === selectedTargetName);
    if (!activeDialog && selectedTargetName !== 'all') {
      navigateTo(`/bot/${projectId}/publish/all`);
    }
  }, [selectedTargetName, projectId, settings.publishTargets]);

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
      // init selected status
      setSelectedVersion(null);
    }
  }, [projectId]);

  useEffect(() => {
    if (settings.publishTargets && settings.publishTargets.length > 0) {
      const selected = settings.publishTargets.find((item) => item.name === selectedTargetName);
      setSelectedTarget(selected);
      // load publish histories
      if (selectedTargetName === 'all') {
        for (const target of settings.publishTargets) {
          getPublishHistory(projectId, target);
        }
      } else if (selected) {
        getPublishHistory(projectId, selected);
      }
    }
  }, [projectId, selectedTargetName]);

  // once history is loaded, display it
  useEffect(() => {
    if (settings.publishTargets && selectedTargetName === 'all') {
      let histories: any[] = [];
      for (const target of settings.publishTargets) {
        if (publishHistory[target.name]) {
          histories = histories.concat(publishHistory[target.name]);
        }
      }
      setThisPublishHistory(histories);
    } else if (selectedTargetName && publishHistory[selectedTargetName]) {
      setThisPublishHistory(publishHistory[selectedTargetName]);
    }
  }, [publishHistory, selectedTargetName, settings.publishTargets]);

  // check history to see if a 202 is found
  useEffect(() => {
    // most recent item is a 202, which means we should poll for updates...
    if (selectedTargetName !== 'all' && thisPublishHistory.length && thisPublishHistory[0].status === 202) {
      getUpdatedStatus(selectedTarget);
    } else if (selectedTarget && selectedTarget.lastPublished && thisPublishHistory.length === 0) {
      // if the history is EMPTY, but we think we've done a publish based on lastPublished timestamp,
      // we still poll for the results IF we see that a publish has happened previously
      getPublishStatus(projectId, selectedTarget);
    }
  }, [thisPublishHistory, selectedTargetName]);

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const targets = (settings.publishTargets || []).concat([
        {
          name,
          type,
          configuration,
        },
      ]);
      await setPublishTargets(targets, projectId);
      onSelectTarget(name);
    },
    [settings.publishTargets, projectId, botName]
  );

  useEffect(() => {
    setDialogProps({
      title: formatMessage('Add a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setAddDialogHidden(true)}
          current={null}
          targets={settings.publishTargets || []}
          types={publishTypes}
          updateSettings={savePublishTarget}
        />
      ),
    });
  }, [publishTypes, savePublishTarget, settings.publishTargets]);

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
      <Dialog
        dialogContentProps={dialogProps}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setAddDialogHidden(true)}
      >
        {dialogProps.children}
      </Dialog>
      {!publishDialogHidden && (
        <PublishDialog
          projectId={projectId}
          target={selectedTarget}
          onDismiss={() => setPublishDialogHidden(true)}
          onSubmit={publish}
        />
      )}
      {showLog && <LogDialog version={selectedVersion} onDismiss={() => setShowLog(false)} />}
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{selectedTarget ? selectedTargetName : formatMessage('Publish Your bots')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <BotStatusList
              botPublishHistoryList={botPublishHistoryList}
              items={botStatusList}
              updatePublishHistory={setThisPublishHistory}
              onLogClick={onShowLog}
              onRollbackClick={onRollbackToVersion}
            />
            {!thisPublishHistory || thisPublishHistory.length === 0 ? (
              <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
            ) : null}
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
