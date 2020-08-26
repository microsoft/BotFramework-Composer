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

import settingsStorage from '../../utils/dialogSettingStorage';
import { projectContainer } from '../design/styles';
import {
  settingsState,
  botNameState,
  publishTypesState,
  projectIdState,
  publishHistoryState,
  dispatcherState,
} from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';

import { TargetList } from './targetList';
import { PublishDialog } from './publishDialog';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor, overflowSet, targetSelected } from './styles';
import { CreatePublishTarget } from './createPublishTarget';
import { PublishStatusList, IStatus } from './publishStatusList';

interface PublishPageProps extends RouteComponentProps<{}> {
  targetName?: string;
}

const Publish: React.FC<PublishPageProps> = (props) => {
  const selectedTargetName = props.targetName;
  const [selectedTarget, setSelectedTarget] = useState<PublishTarget | undefined>();
  const settings = useRecoilValue(settingsState);
  const botName = useRecoilValue(botNameState);
  const publishTypes = useRecoilValue(publishTypesState);
  const projectId = useRecoilValue(projectIdState);
  const publishHistory = useRecoilValue(publishHistoryState);
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
  const [editDialogHidden, setEditDialogHidden] = useState(true);

  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);

  // items to show in the list
  const [thisPublishHistory, setThisPublishHistory] = useState<IStatus[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<IStatus | null>(null);
  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });
  const [editDialogProps, setEditDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });
  const [editTarget, setEditTarget] = useState<{ index: number; item: PublishTarget } | null>(null);

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
      type: 'action',
      text: formatMessage('Add new profile'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setAddDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-Toolbar-Add',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Publish to selected profile'),
      buttonProps: {
        iconProps: {
          iconName: 'CloudUpload',
        },
        onClick: () => setPublishDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-Toolbar-Publish',
      disabled: selectedTargetName !== 'all' ? false : true,
    },
    {
      type: 'action',
      text: formatMessage('See Log'),
      buttonProps: {
        iconProps: {
          iconName: 'ClipboardList',
        },
        onClick: () => setShowLog(true),
      },
      align: 'left',
      disabled: selectedVersion ? false : true,
      dataTestid: 'publishPage-Toolbar-Log',
    },
    {
      type: 'action',
      text: formatMessage('Rollback'),
      buttonProps: {
        iconProps: {
          iconName: 'ClipboardList',
        },
        onClick: () => rollbackToVersion(selectedVersion),
      },
      align: 'left',
      disabled: selectedTarget && selectedVersion ? !isRollbackSupported(selectedTarget, selectedVersion) : true,
      dataTestid: 'publishPage-Toolbar-Log',
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
      getPublishTargetTypes();
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
      const groups: any[] = [];
      let startIndex = 0;
      for (const target of settings.publishTargets) {
        if (publishHistory[target.name]) {
          histories = histories.concat(publishHistory[target.name]);
          groups.push({
            key: target.name,
            name: target.name,
            startIndex: startIndex,
            count: publishHistory[target.name].length,
            level: 0,
          });
          startIndex += publishHistory[target.name].length;
        }
      }
      setGroups(groups);
      setThisPublishHistory(histories);
    } else if (selectedTargetName && publishHistory[selectedTargetName]) {
      setThisPublishHistory(publishHistory[selectedTargetName]);
      setGroups([
        {
          key: selectedTargetName,
          name: selectedTargetName,
          startIndex: 0,
          count: publishHistory[selectedTargetName].length,
          level: 0,
        },
      ]);
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
      await setPublishTargets(targets);
      onSelectTarget(name);
    },
    [settings.publishTargets, projectId, botName]
  );

  const updatePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      if (!editTarget) {
        return;
      }

      const targets = settings.publishTargets ? [...settings.publishTargets] : [];

      targets[editTarget.index] = {
        name,
        type,
        configuration,
      };

      await setPublishTargets(targets);

      onSelectTarget(name);
    },
    [settings.publishTargets, projectId, botName, editTarget]
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

  useEffect(() => {
    setEditDialogProps({
      title: formatMessage('Edit a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setEditDialogHidden(true)}
          current={editTarget ? editTarget.item : null}
          targets={(settings.publishTargets || []).filter((item) => editTarget && item.name != editTarget.item.name)}
          types={publishTypes}
          updateSettings={updatePublishTarget}
        />
      ),
    });
  }, [editTarget, publishTypes, updatePublishTarget]);

  const rollbackToVersion = useMemo(
    () => async (version) => {
      const sensitiveSettings = settingsStorage.get(projectId);
      await rollbackToVersionDispatcher(projectId, selectedTarget, version.id, sensitiveSettings);
    },
    [projectId, selectedTarget]
  );

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

        await setPublishTargets(updatedPublishTargets);
      }
    },
    [projectId, selectedTarget, settings.publishTargets]
  );

  const onEdit = async (index: number, item: PublishTarget) => {
    const newItem = { item: item, index: index };
    setEditTarget(newItem);
    setEditDialogHidden(false);
  };

  const onDelete = useMemo(
    () => async (index: number) => {
      const result = await OpenConfirmModal(
        formatMessage('This will delete the profile. Do you wish to continue?'),
        null,
        {
          confirmBtnText: formatMessage('Yes'),
          cancelBtnText: formatMessage('Cancel'),
        }
      );

      if (result) {
        if (settings.publishTargets && settings.publishTargets.length > index) {
          const targets = settings.publishTargets.slice(0, index).concat(settings.publishTargets.slice(index + 1));
          await setPublishTargets(targets);
          // redirect to all profiles
          setSelectedTarget(undefined);
          onSelectTarget('all');
        }
      }
    },
    [settings.publishTargets, projectId, botName]
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
      <Dialog
        dialogContentProps={editDialogProps}
        hidden={editDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setEditDialogHidden(true)}
      >
        {editDialogProps.children}
      </Dialog>
      {!publishDialogHidden && (
        <PublishDialog target={selectedTarget} onDismiss={() => setPublishDialogHidden(true)} onSubmit={publish} />
      )}
      {showLog && <LogDialog version={selectedVersion} onDismiss={() => setShowLog(false)} />}
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{selectedTarget ? selectedTargetName : formatMessage('Publish Profiles')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div
          aria-label={formatMessage('Navigation panel')}
          css={projectContainer}
          data-testid="target-list"
          role="region"
        >
          <div
            key={'_all'}
            css={selectedTargetName === 'all' ? targetSelected : overflowSet}
            style={{
              height: '36px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedTarget(undefined);
              onSelectTarget('all');
            }}
          >
            {formatMessage('All profiles')}
          </div>
          {settings && settings.publishTargets && (
            <TargetList
              list={settings.publishTargets}
              selectedTarget={selectedTargetName}
              onDelete={async (index) => await onDelete(index)}
              onEdit={async (item, target) => await onEdit(item, target)}
              onSelect={(item) => {
                setSelectedTarget(item);
                onSelectTarget(item.name);
              }}
            />
          )}
        </div>
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <PublishStatusList
              groups={groups}
              items={thisPublishHistory}
              updateItems={setThisPublishHistory}
              onItemClick={setSelectedVersion}
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
