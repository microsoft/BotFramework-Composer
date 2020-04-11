// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect, Fragment, useCallback, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import settingsStorage from '../../utils/dialogSettingStorage';
import { projectContainer } from '../design/styles';
import { StoreContext } from '../../store';
import { openInEmulator, navigateTo } from '../../utils';

import { TargetList } from './targetList';
import { PublishDialog } from './publishDialog';
import { ToolBar } from './../../components/ToolBar/index';
import {
  ContentHeaderStyle,
  HeaderText,
  ContentStyle,
  contentEditor,
  targetListItemSelected,
  targetListItemNotSelected,
} from './styles';
import { CreatePublishTarget } from './createPublishTarget';
import { PublishStatusList } from './publishStatusList';

interface PublishPageProps extends RouteComponentProps<{}> {
  targetName?: string;
}

const Publish: React.FC<PublishPageProps> = props => {
  const selectedTargetName = props.targetName;
  const [selectedTarget, setSelectedTarget] = useState();
  const { state, actions } = useContext(StoreContext);
  const { settings, botName, publishTypes, projectId, publishHistory } = state;

  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);
  // items to show in the list
  const [thisPublishHistory, setThisPublishHistory] = useState<any[]>([]);
  const [groups, setGroups] = useState();
  const [selectedVersion, setSelectedVersion] = useState();
  const [dialogProps, setDialogProps] = useState({
    title: 'Title',
    type: DialogType.normal,
    children: {},
  });

  const isRollbackSupported = useMemo(
    () => (target, version): boolean => {
      if (version.id && version.status === 200 && target) {
        const type = publishTypes?.filter(t => t.name === target.type)[0];
        if (type?.features?.rollback) {
          return true;
        } else {
          console.log('rollback not supported on', type);
        }
      } else {
        console.log('no rollback to version without id or non 200 status');
      }
      return false;
    },
    [projectId, publishTypes]
  );

  const toolbarItems = [
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
      dataTestid: 'publishPage-ToolBar-Add',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Publish to selected target'),
      buttonProps: {
        iconProps: {
          iconName: 'CloudUpload',
        },
        onClick: () => setPublishDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Publish',
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
      dataTestid: 'publishPage-ToolBar-Log',
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
      disabled: selectedVersion ? !isRollbackSupported(selectedTarget, selectedVersion) : true,
      dataTestid: 'publishPage-ToolBar-Log',
    },
    {
      type: 'action',
      text: formatMessage('Test in Emulator'),
      align: 'left',
      buttonProps: {
        iconProps: {
          iconName: 'OpenInNewTab',
        },
        style: { display: thisPublishHistory?.length > 0 && thisPublishHistory[0].status === 200 ? 'block' : 'none' },
        onClick: async () => {
          return Promise.resolve(
            openInEmulator(
              thisPublishHistory[0].endpoint,
              settings.MicrosoftAppId && settings.MicrosoftAppPassword
                ? { MicrosoftAppId: settings.MicrosoftAppId, MicrosoftAppPassword: settings.MicrosoftAppPassword }
                : { MicrosoftAppPassword: '', MicrosoftAppId: '' }
            )
          );
        },
      },
    },
  ];

  const onSelectTarget = useCallback(
    targetName => {
      const url = `/bot/${projectId}/publish/${targetName}`;
      navigateTo(url);
    },
    [projectId]
  );

  const getUpdatedStatus = target => {
    if (target) {
      // TODO: this should use a backoff mechanism to not overload the server with requests
      // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
      setTimeout(() => {
        actions.getPublishStatus(projectId, target);
      }, 10000);
    }
  };

  useEffect(() => {
    if (projectId) {
      actions.getPublishTargetTypes();
      // init selected status
      setSelectedVersion(undefined);
    }
  }, [projectId]);

  useEffect(() => {
    if (settings.publishTargets && settings.publishTargets.length > 0) {
      const _selected = settings.publishTargets.find(item => item.name === selectedTargetName);

      setSelectedTarget(_selected);
      // load publish histories
      if (selectedTargetName === 'all') {
        for (const target of settings.publishTargets) {
          actions.getPublishHistory(projectId, target);
        }
      } else if (selectedTargetName !== 'no' && _selected) {
        actions.getPublishHistory(projectId, _selected);
      }
    }
  }, [selectedTargetName, settings.publishTargets]);

  // once history is loaded, display it
  useEffect(() => {
    if (settings.publishTargets && selectedTargetName === 'all') {
      let _histories: any[] = [];
      const _groups: any[] = [];
      let startIndex = 0;
      for (const target of settings.publishTargets) {
        if (publishHistory[target.name]) {
          _histories = _histories.concat(publishHistory[target.name]);
          _groups.push({
            key: target.name,
            name: target.name,
            startIndex: startIndex,
            count: publishHistory[target.name].length,
            level: 0,
          });
          startIndex += publishHistory[target.name].length;
        }
      }
      setGroups(_groups);
      setThisPublishHistory(_histories);
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
  }, [publishHistory]);

  // check history to see if a 202 is found
  useEffect(() => {
    // most recent item is a 202, which means we should poll for updates...
    if (selectedTargetName !== 'all' && thisPublishHistory.length && thisPublishHistory[0].status === 202) {
      console.log('Found a 202, will query for updates...');
      getUpdatedStatus(selectedTarget);
    } else if (selectedTarget && selectedTarget.lastPublished && thisPublishHistory.length === 0) {
      // if the history is EMPTY, but we think we've done a publish based on lastPublished timestamp,
      // we still poll for the results IF we see that a publish has happened previously
      actions.getPublishStatus(projectId, selectedTarget);
    }
  }, [thisPublishHistory]);

  useEffect(() => {
    setDialogProps({
      title: 'Add a publish target',
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          targetTypes={publishTypes.map(type => {
            return { key: type.name, text: type.name };
          })}
          targets={settings.publishTargets}
          onSave={savePublishTarget}
          onCancel={() => setAddDialogHidden(true)}
        />
      ),
    });
  }, [publishTypes]);

  const rollbackToVersion = useMemo(
    () => version => {
      const sensitiveSettings = settingsStorage.get(botName);
      console.log('ROLLBACK TO ', version);
      actions.rollbackToVersion(projectId, selectedTarget, version.id, sensitiveSettings);
    },
    [projectId]
  );

  const savePublishTarget = useMemo(
    () => (name, type, configuration) => {
      const _target = (settings.publishTargets || []).concat([
        {
          name,
          type,
          configuration,
        },
      ]);
      actions.setSettings(
        projectId,
        botName,
        {
          ...settings,
          publishTargets: _target,
        },
        undefined
      );
    },
    [projectId]
  );

  const publish = useMemo(
    () => async comment => {
      // publish to remote
      if (selectedTarget && settings.publishTargets) {
        const sensitiveSettings = settingsStorage.get(botName);
        await actions.publishToTarget(projectId, selectedTarget, { comment: comment }, sensitiveSettings);

        // update the target with a lastPublished date
        const updatedPublishTargets = settings.publishTargets.map(profile => {
          if (profile.name === selectedTarget.name) {
            return {
              ...profile,
              lastPublished: new Date(),
            };
          } else {
            return profile;
          }
        });

        actions.setSettings(
          projectId,
          botName,
          {
            ...settings,
            publishTargets: updatedPublishTargets,
          },
          undefined
        );
      }
    },
    [projectId]
  );

  return (
    <div>
      <Dialog
        hidden={addDialogHidden}
        onDismiss={() => setAddDialogHidden(true)}
        dialogContentProps={dialogProps}
        modalProps={{ isBlocking: true }}
        minWidth={350}
      >
        {dialogProps.children}
      </Dialog>
      <PublishDialog
        hidden={publishDialogHidden}
        onDismiss={() => setPublishDialogHidden(true)}
        onSubmit={publish}
        target={selectedTarget}
      />
      <LogDialog hidden={!showLog} version={selectedVersion} onDismiss={() => setShowLog(false)} />
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{selectedTarget ? selectedTargetName : formatMessage('Publish Profiles')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish">
        <div css={projectContainer}>
          <DefaultButton
            key={'_all'}
            onClick={() => {
              setSelectedTarget(undefined);
              onSelectTarget('all');
            }}
            text={formatMessage('All profiles')}
            styles={selectedTargetName === 'all' ? targetListItemSelected : targetListItemNotSelected}
          />
          {settings && settings.publishTargets ? (
            <TargetList
              list={settings.publishTargets}
              onSelect={item => {
                setSelectedTarget(item);
                onSelectTarget(item.name);
              }}
              selectedTarget={selectedTargetName}
            />
          ) : (
            <div>No publish target</div>
          )}
        </div>
        <div css={contentEditor}>
          <Fragment>
            <PublishStatusList items={thisPublishHistory} groups={groups} onItemClick={setSelectedVersion} />
            {!thisPublishHistory || thisPublishHistory.length === 0 ? (
              <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
            ) : null}
          </Fragment>
        </div>
      </div>
    </div>
  );
};

export default Publish;
const LogDialog = props => {
  const logDialogProps = {
    title: 'Publish Log',
  };
  return (
    <Dialog
      hidden={props.hidden}
      onDismiss={props.onDismiss}
      dialogContentProps={logDialogProps}
      modalProps={{ isBlocking: true }}
      minWidth={450}
    >
      <TextField
        value={props && props.version ? props.version.log : ''}
        placeholder="Log Output"
        multiline={true}
        style={{ minHeight: 300 }}
      />
    </Dialog>
  );
};
