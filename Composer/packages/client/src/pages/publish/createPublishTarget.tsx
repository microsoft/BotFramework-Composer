// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
// import { useState, useContext } from 'react';
import formatMessage from 'format-message';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Fragment, useState } from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

export const CreatePublishTarget = props => {
  const [targetType, setTargetType] = useState('');
  const [name, setName] = useState('');
  const [config, setConfig] = useState('{}');
  const updateType = (e, type) => {
    // console.log('UPDATE TYPE', type);
    setTargetType(type.key);
  };
  const updateConfig = (e, newConfig) => {
    // console.log('UPDATE CONFIG', config);
    // todo: attempt json parse and only allow submit if json is valid
    setConfig(newConfig);
  };
  const updateName = (e, newName) => {
    setName(newName);
  };

  const submit = () => {
    try {
      JSON.parse(config);
    } catch (err) {
      // configuration json is invalid
      alert('JSON IS INVALID');
      console.log(err);
      return;
    }

    try {
      props.onSave(name, targetType, config);
    } catch (err) {
      // name is taken
      alert('NAME IS TAKEN');
      return;
    }
    props.onCancel();
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <TextField
          placeholder="My Publish Target"
          label={formatMessage('Name')}
          // styles={styles.input}
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
          // styles={styles.textarea}
          onChange={updateConfig}
          multiline={true}
        />
      </form>
      <DialogFooter>
        <DefaultButton onClick={props.onCancel} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={submit} text={formatMessage('Save')} />
      </DialogFooter>
    </Fragment>
  );
};
