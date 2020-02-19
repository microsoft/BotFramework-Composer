// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useEffect, useState, Fragment } from 'react';
import formatMessage from 'format-message';
import TimeAgo from 'react-timeago';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { isAbsHosted } from '../../../utils/envUtil';

import { StoreContext } from './../../../store';
import { styles } from './styles';

const DateWidget = props => {
  const { date } = props;

  const timestamp = new Date(date);
  const now = new Date();

  const minutesAgo = parseInt((now.getTime() - timestamp.getTime()) / 60000);

  if (minutesAgo < 60) {
    return <TimeAgo date={date} />;
  } else {
    const formattedDate = timestamp.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    return <span>{formattedDate}</span>;
  }
};

export const Publisher = () => {
  const { state, actions } = useContext(StoreContext);
  const [dialogHidden, setDialogHidden] = useState(true);
  const [publishAction, setPublishAction] = useState('');
  const [dialogProps, setDialogProps] = useState({
    title: 'Title',
    subText: 'Sub Text',
    type: DialogType.normal,
    children: [],
  });
  const {
    botName,
    botEnvironment,
    publishVersions,
    remoteEndpoints,
    settings,
    publishStatus,
    publishTypes,
    publishTargets,
  } = state;
  const [slot, setSlot] = useState(botEnvironment === 'editing' ? 'integration' : botEnvironment);
  const absHosted = isAbsHosted();

  useEffect(() => {
    // load up the list of all publish targets
    actions.getPublishTargetTypes();

    // display current targets
    updatePublishTargets(settings.publishTargets || []);
  }, []);

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

  useEffect(() => {
    console.log('publish targets changed');
    if (
      publishTargets.filter(target => {
        return target.statusCode === 202;
      }).length
    ) {
      actions.getPublishStatus();
      console.log('NEED TO LOAD PUBLISH STATUS');
    }
  }, [publishTargets]);

  const savePublishTarget = (name, type, configuration) => {
    alert(`save ${name} ${type} ${configuration}`);

    if (!settings.publishTargets) {
      settings.publishTargets = [];
    }

    settings.publishTargets.push({
      name,
      type,
      configuration,
    });

    actions.setSettings(state.projectId, botName, settings, absHosted ? slot : undefined);

    updatePublishTargets(settings.publishTargets || []);
  };

  const addDestination = async () => {
    setDialogProps({
      title: 'Add Target',
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          targetTypes={publishTypes.map(type => {
            return { key: type, text: type };
          })}
          onSave={savePublishTarget}
        />
      ),
    });
    setDialogHidden(false);
  };

  const closeConfirm = () => {
    setDialogHidden(true);
  };

  const publishToTarget = index => {
    return async () => {
      if (publishTargets[index]) {
        const target = publishTargets[index];
        console.log('PUBLISH TO TARGET', target);
        await actions.publishToTarget(state.projectId, target);
      }
    };
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Publish your bot to a remote</h1>
      <PrimaryButton text="Add Destination" onClick={addDestination} styles={styles.button} />
      {publishTypes && publishTypes.length && <div>publish to types: {publishTypes.join(',')}</div>}

      {publishTargets.map((target, i) => {
        return (
          <div key={i}>
            <p>
              <label>Name:</label>
              {target.name}
              <PrimaryButton text="Publish" onClick={publishToTarget(i)} />
            </p>
          </div>
        );
      })}

      {!publishVersions && <div>{formatMessage('Loading')}</div>}

      <Dialog hidden={dialogHidden} onDismiss={closeConfirm} dialogContentProps={dialogProps}>
        {dialogProps.children}
        {dialogProps.footer && <DialogFooter>{dialogProps.footer}</DialogFooter>}
      </Dialog>
    </div>
  );
};

const CreatePublishTarget = props => {
  let targetType = '';
  let config = '';
  let name = '';
  const updateType = (e, type) => {
    // console.log('UPDATE TYPE', type);
    targetType = type.key;
  };
  const updateConfig = (e, newConfig) => {
    // console.log('UPDATE CONFIG', config);
    // todo: attempt json parse and only allow submit if json is valid
    config = newConfig;
  };
  const updateName = (e, newName) => {
    name = newName;
  };

  const submit = () => {
    try {
      JSON.parse(config);
      return props.onSave(name, targetType, config);
    } catch (err) {
      alert('Error parsing configuration');
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        create a publish target.
        <TextField
          placeholder="My Publish Target"
          label={formatMessage('Name')}
          styles={styles.input}
          onChange={updateName}
        />
        <Dropdown
          placeholder={formatMessage('Choose One')}
          label={formatMessage('Publish Destination Type')}
          options={props.targetTypes}
          onChange={updateType}
        />
        <TextField
          label={formatMessage('Paste Configuration')}
          styles={styles.textarea}
          onChange={updateConfig}
          multiline={true}
        />
      </form>
      <DialogFooter>
        <PrimaryButton onClick={submit} text={formatMessage('Save')} />
      </DialogFooter>
    </Fragment>
  );
};
