// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import settingsStorage from '../../utils/dialogSettingStorage';
import { projectContainer } from '../design/styles';
import { StoreContext } from '../../store';

import { PublishDialog } from './publishDialog';
import { ToolBar } from './../../components/ToolBar/index';
import {
  ContentHeaderStyle,
  HeaderText,
  ContentStyle,
  contentEditor,
  targetListTiTle,
  targetListItemSelected,
  targetListItemNotSelected,
  historyPanelTitle,
  historyPanelSub,
} from './styles';
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
  const [publishTarget, setPublishTarget] = useState<any[]>([]);
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
      text: formatMessage('Log'),
      buttonProps: {
        iconProps: {
          iconName: 'ClipboardList',
        },
        onClick: () => setLogDialogStatus(true),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Log',
    },
  ];

  useEffect(() => {
    // load up the list of all publish targets
    actions.getPublishTargetTypes();
    if (settings.publishTargets) {
      setPublishTarget(settings.publishTargets);
    }
  }, [settings]);

  useEffect(() => {
    // get selected target publish history
    if (selectedTarget) {
      actions.getPublishHistory(projectId, selectedTarget);
    }
  }, [selectedTarget]);

  // once history is loaded, display it
  useEffect(() => {
    if (selectedTarget && publishHistory[selectedTarget.name]) {
      setThisPublishHistory(publishHistory[selectedTarget.name]);
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

    actions.setSettings(
      projectId,
      botName,
      {
        ...settings,
        publishTargets: [
          {
            name,
            type,
            configuration,
          },
        ].concat(publishTarget),
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
      <LogDialog hidden={!showLog} onDismiss={() => setLogDialogStatus(false)} />
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Publish Profiles')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish">
        <div css={projectContainer}>
          {publishTarget.length > 0 ? (
            <Fragment>
              <div css={targetListTiTle}>All profiles</div>
              <TargetList list={settings.publishTargets} onSelect={setSelectedTarget} selectedTarget={selectedTarget} />
            </Fragment>
          ) : (
            <div>This bot does not have a profile to publish yet</div>
          )}
        </div>
        <div css={contentEditor}>
          {selectedTarget ? (
            <Fragment>
              <span css={historyPanelTitle}>{selectedTarget.name}</span>
              <span css={historyPanelSub}>{publishTypes.find(item => item === selectedTarget.type)}</span>
              {selectedTarget && thisPublishHistory.length > 0 ? (
                <PublishStatusList items={thisPublishHistory} onItemClick={item => console.log(item)} />
              ) : (
                <div css={historyPanelSub} style={{ paddingTop: '16px' }}>
                  No publish history
                </div>
              )}
            </Fragment>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default Publish;

const TargetList = props => {
  return props.list.map(target => {
    return (
      <DefaultButton
        key={target.name}
        onClick={() => props.onSelect(target)}
        styles={
          props.selectedTarget && props.selectedTarget.name === target.name
            ? targetListItemSelected
            : targetListItemNotSelected
        }
        text={target.name}
        ariaLabel={formatMessage('Publish Target')}
        ariaHidden={false}
      />
    );
  });
};

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
      <TextField placeholder="log message" multiline={true} style={{ minHeight: 300 }} />
    </Dialog>
  );
};
