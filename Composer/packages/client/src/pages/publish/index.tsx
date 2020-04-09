// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import settingsStorage from '../../utils/dialogSettingStorage';
import { projectContainer } from '../design/styles';
import { StoreContext } from '../../store';
import { openInEmulator } from '../../utils';
import { DefaultPublishConfig } from '../../constants';

import { TargetList } from './targetList';
import { PublishDialog } from './publishDialog';
import { ToolBar } from './../../components/ToolBar/index';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { CreatePublishTarget } from './createPublishTarget';
import { PublishStatusList } from './publishStatusList';

const Publish: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { settings, botName, publishTypes, projectId, publishHistory } = state;
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [publishDialogHidden, setPublishDialogHidden] = useState(true);
  const [thisPublishHistory, setThisPublishHistory] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState();
  const [selectedVersion, setSelectedVersion] = useState();

  const [groups, setGroups] = useState();
  const [publishTarget, setPublishTarget] = useState<any[]>([DefaultPublishConfig]);
  const [dialogProps, setDialogProps] = useState({
    title: 'Title',
    type: DialogType.normal,
    children: {},
  });
  const toolbarItems = [
    {
      type: 'action',
      text: formatMessage('Add new profile'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => addPublishTarget(),
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
        onClick: () => selectPublishTarget(),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Publish',
      disabled: selectedTarget ? false : true,
    },
    {
      type: 'action',
      text: formatMessage('See Log'),
      buttonProps: {
        iconProps: {
          iconName: 'ClipboardList',
        },
        onClick: () => setLogDialogStatus(true),
      },
      align: 'left',
      disabled: selectedVersion ? false : true,
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

  useEffect(() => {
    if (projectId) {
      // load up the list of all publish targets
      actions.getPublishTargetTypes();
    }
  }, [projectId]);

  useEffect(() => {
    if (settings.publishTargets?.length > 0) {
      setPublishTarget([DefaultPublishConfig].concat(settings.publishTargets));
    }
  }, [settings.publishTargets]);

  useEffect(() => {
    // get selected target publish history
    if (selectedTarget && selectedTarget.type === 'all') {
      for (const target of publishTarget) {
        actions.getPublishHistory(projectId, target);
      }
    } else if (selectedTarget && selectedTarget.type !== 'no') {
      actions.getPublishHistory(projectId, selectedTarget);
      setSelectedVersion(undefined);
    }
  }, [selectedTarget]);

  // once history is loaded, display it
  useEffect(() => {
    if (selectedTarget?.type === 'all') {
      let histories: any[] = [];
      const _groups: any[] = [];
      let startIndex = 0;
      for (const name in publishHistory) {
        histories = histories.concat(publishHistory[name]);
        _groups.push({
          key: name,
          name: name,
          startIndex: startIndex,
          count: publishHistory[name].length,
          level: 0,
        });
        startIndex += publishHistory[name].length;
      }
      setGroups(_groups);
      setThisPublishHistory(histories);
    } else if (selectedTarget && publishHistory[selectedTarget.name]) {
      setThisPublishHistory(publishHistory[selectedTarget.name]);
      setGroups([
        {
          key: selectedTarget.name,
          name: selectedTarget.name,
          startIndex: 0,
          count: publishHistory[selectedTarget.name].length,
          level: 0,
        },
      ]);
    }
  }, [publishHistory]);

  // check history to see if a 202 is found
  useEffect(() => {
    // most recent item is a 202, which means we should poll for updates...
    if (selectedTarget && thisPublishHistory.length && thisPublishHistory[0].status === 202) {
      console.log('Found a 202, will query for updates...');
      getUpdatedStatus(selectedTarget);
    } else if (selectedTarget && selectedTarget.lastPublished && !thisPublishHistory.length) {
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
            return { key: type, text: type };
          })}
          targets={settings.publishTargets}
          onSave={savePublishTarget}
          onCancel={closeAddDialog}
        />
      ),
    });
  }, [publishTypes]);

  const getUpdatedStatus = target => {
    if (target) {
      // TODO: this should use a backoff mechanism to not overload the server with requests
      // OR BETTER YET, use a websocket events system to receive updates... (SOON!)
      setTimeout(() => {
        actions.getPublishStatus(projectId, target);
      }, 10000);
    }
  };

  const addPublishTarget = () => {
    setAddDialogHidden(false);
  };

  const selectPublishTarget = () => {
    setPublishDialogHidden(false);
  };

  const closeAddDialog = () => {
    setAddDialogHidden(true);
  };

  const closePublishDialog = () => {
    setPublishDialogHidden(true);
  };

  const setLogDialogStatus = (status: boolean) => {
    setShowLog(status);
  };

  const savePublishTarget = (name, type, configuration) => {
    console.log(`save ${name} ${type} ${configuration}`);
    const _target = publishTarget.concat([
      {
        name,
        type,
        configuration,
      },
    ]);
    console.log(_target);
    setPublishTarget(_target);
    actions.setSettings(
      projectId,
      botName,
      {
        ...settings,
        publishTargets: _target,
      },
      undefined
    );
  };

  const publish = async comment => {
    // publish to remote
    if (selectedTarget) {
      const sensitiveSettings = settingsStorage.get(botName);
      await actions.publishToTarget(projectId, selectedTarget, { comment: comment }, sensitiveSettings);

      // update the target with a lastPublished date
      const updatedPublishTargets = publishTarget.map(profile => {
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
  };

  return (
    <div>
      <Dialog
        hidden={addDialogHidden}
        onDismiss={closeAddDialog}
        dialogContentProps={dialogProps}
        modalProps={{ isBlocking: true }}
        minWidth={350}
      >
        {dialogProps.children}
      </Dialog>
      <PublishDialog
        hidden={publishDialogHidden}
        onDismiss={closePublishDialog}
        onSubmit={publish}
        target={selectedTarget}
      />
      <LogDialog hidden={!showLog} version={selectedVersion} onDismiss={() => setLogDialogStatus(false)} />
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>
          {selectedTarget && selectedTarget.type !== 'no' && selectedTarget.type !== 'all'
            ? selectedTarget.name
            : formatMessage('Publish Profiles')}
        </h1>
      </div>
      <div css={ContentStyle} data-testid="Publish">
        <div css={projectContainer}>
          <TargetList list={publishTarget} onSelect={setSelectedTarget} selectedTarget={selectedTarget} />
        </div>
        <div css={contentEditor}>
          <Fragment>
            <PublishStatusList items={thisPublishHistory} groups={groups} onItemClick={setSelectedVersion} />
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
