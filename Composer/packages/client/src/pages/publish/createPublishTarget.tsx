// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Fragment, useState, useMemo } from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';

import { PublishTarget, PublishType } from '../../store/types';

import { label } from './styles';

interface CreatePublishTargetProps {
  current: PublishTarget | null;
  targets: PublishTarget[];
  updateSettings: (name: string, type: PublishType, configuration: string) => Promise<void>;
  closeDialog: () => void;
}

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = props => {
  const [targetType, setTargetType] = useState<PublishType | null>(props.current ? props.current.type : null);
  const [name, setName] = useState(props.current ? props.current.name : '');
  const [config, setConfig] = useState(props.current ? JSON.parse(props.current.configuration) : {});
  const [errorMessage, setErrorMsg] = useState('');

  const targetTypes = useMemo(() => {
    return props.targets.map(t => ({ key: t.name, text: t.name }));
  }, [props.targets]);

  const updateType = (_e, type?: IDropdownOption) => {
    const target = props.targets.find(t => t.name === type?.key);

    if (target) {
      setTargetType(target.type);
    }
  };
  const updateConfig = newConfig => {
    setConfig(newConfig);
  };

  const isNameValid = newName => {
    if (!newName || newName.trim() === '') {
      setErrorMsg(formatMessage('Must have a name'));
    } else {
      const exists = !!props.targets?.find(t => t.name.toLowerCase() === newName?.toLowerCase);

      if (exists) {
        setErrorMsg(formatMessage('A profile with that name already exists.'));
      }
    }
  };

  const updateName = (e, newName) => {
    setErrorMsg('');
    setName(newName);
    isNameValid(newName);
  };

  const isDisable = () => {
    if (!targetType || !name || errorMessage) {
      return true;
    } else {
      return false;
    }
  };

  const submit = async () => {
    if (targetType) {
      await props.updateSettings(name, targetType, JSON.stringify(config, null, 2) || '{}');
      props.closeDialog();
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <TextField
          placeholder={formatMessage('My Publish Profile')}
          defaultValue={props.current ? props.current.name : ''}
          label={formatMessage('Name')}
          onChange={updateName}
          errorMessage={errorMessage}
        />
        <Dropdown
          placeholder={formatMessage('Choose One')}
          label={formatMessage('Publish Destination Type')}
          options={targetTypes}
          defaultSelectedKey={props.current ? props.current.type.name : null}
          onChange={updateType}
        />
        <div css={label}>{formatMessage('Paste Configuration')}</div>
        <JsonEditor onChange={updateConfig} height={200} value={config} />
        <button type="submit" hidden disabled={isDisable()} />
      </form>
      <DialogFooter>
        <DefaultButton onClick={props.closeDialog} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={submit} disabled={isDisable()} text={formatMessage('Save')} />
      </DialogFooter>
    </Fragment>
  );
};

export { CreatePublishTarget };
