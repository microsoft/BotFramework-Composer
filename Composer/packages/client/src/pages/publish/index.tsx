// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { projectContainer } from '../design/styles';
import { StoreContext } from '../../store';

import { ToolBar } from './../../components/ToolBar/index';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { CreatePublishTarget } from './createPublishTarget';

const Publish: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { publishTargets, settings, botName, publishTypes } = state;
  const [dialogHidden, setDialogHidden] = useState(true);
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
        onClick: () => console.log('publish to target'),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Publish',
      disabled: false,
    },
  ];

  useEffect(() => {
    // load up the list of all publish targets
    actions.getPublishTargetTypes();

    // display current targets
    updatePublishTargets(settings.publishTargets || []);
  }, []);

  const addPublishTarget = () => {
    setDialogHidden(false);
  };

  const closeConfirm = () => {
    setDialogHidden(true);
  };

  const savePublishTarget = (name, type, configuration) => {
    console.log(`save ${name} ${type} ${configuration}`);

    if (!settings.publishTargets) {
      settings.publishTargets = [];
    }

    settings.publishTargets.push({
      name,
      type,
      configuration,
    });

    actions.setSettings(state.projectId, botName, settings, undefined);

    updatePublishTargets(settings.publishTargets || []);
  };

  const dialogProps = {
    title: 'Add a publish target',
    type: DialogType.normal,
    children: (
      <CreatePublishTarget
        targetTypes={publishTypes.map(type => {
          return { key: type, text: type };
        })}
        onSave={savePublishTarget}
        onCancel={closeConfirm}
      />
    ),
  };

  const updatePublishTargets = async rawTargets => {
    // make sure there is space for the status to be loaded
    const targets = rawTargets.map(target => {
      return {
        status: '',
        statusCode: 202,
        ...target,
      };
    });

    console.log('SET PUBLISH TARGETS', targets);
    for (let i = 0; i < targets.length; i++) {
      publishTargets.push(targets[i]);
    }
  };

  return (
    <div>
      <Dialog hidden={dialogHidden} onDismiss={closeConfirm} dialogContentProps={dialogProps}>
        {dialogProps.children}
      </Dialog>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Publish Profiles')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish">
        <div css={projectContainer}>
          {(!publishTargets || publishTargets.length < 1) && <div>This bot does not have a profile to publish yet</div>}
        </div>
        <div css={contentEditor}></div>
      </div>
    </div>
  );
};
export default Publish;
