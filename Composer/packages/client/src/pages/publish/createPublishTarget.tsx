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
import { JsonEditor } from '@bfc/code-editor';

import { label } from './styles';

export const CreatePublishTarget = props => {
  const [targetType, setTargetType] = useState(props.current ? props.current.type : '');
  const [name, setName] = useState(props.current ? props.current.name : '');
  const [config, setConfig] = useState(props.current ? JSON.parse(props.current.configuration) : {});
  const [errorMessage, setErrorMsg] = useState('');

  const updateType = (e, type) => {
    setTargetType(type.key);
  };
  const updateConfig = newConfig => {
    setConfig(newConfig);
  };

  const updateName = (e, newName) => {
    setErrorMsg('');
    setName(newName);
    isNameValid(newName);
  };

  const isNameValid = newName => {
    if (!newName || newName.trim() === '') {
      setErrorMsg(formatMessage('Must have a name'));
    } else {
      const exists =
        props.targets?.filter(t => {
          return t.name.toLowerCase() === newName?.toLowerCase();
        }).length > 0;
      if (exists) {
        setErrorMsg(formatMessage('A profile with that name already exists.'));
      }
    }
  };

  const isDisable = () => {
    if (!targetType || !name || errorMessage) {
      return true;
    } else {
      return false;
    }
  };

  const submit = async () => {
    await props.onSave(name, targetType, JSON.stringify(config, null, 2) || '{}');
    props.onCancel();
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <TextField
          placeholder="My Publish Profile"
          defaultValue={props.current ? props.current.name : null}
          label={formatMessage('Name')}
          onChange={updateName}
          errorMessage={errorMessage}
        />
        <Dropdown
          placeholder={formatMessage('Choose One')}
          label={formatMessage('Publish Destination Type')}
          options={props.targetTypes}
          defaultSelectedKey={props.current ? props.current.type : null}
          onChange={updateType}
        />
        <div css={label}>{formatMessage('Paste Configuration')}</div>
        <JsonEditor onChange={updateConfig} height={200} value={config} />
      </form>
      <DialogFooter>
        <DefaultButton onClick={props.onCancel} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={submit} disabled={isDisable()} text={formatMessage('Save')} />
      </DialogFooter>
    </Fragment>
  );
};
