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
  closeDialog: () => void;
  current: PublishTarget | null;
  targets: PublishTarget[];
  types: PublishType[];
  updateSettings: (name: string, type: string, configuration: string) => Promise<void>;
}

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = props => {
  const [targetType, setTargetType] = useState<string | undefined>(props.current?.type);
  const [name, setName] = useState(props.current ? props.current.name : '');
  const [config, setConfig] = useState(props.current ? JSON.parse(props.current.configuration) : undefined);
  const [errorMessage, setErrorMsg] = useState('');

  const targetTypes = useMemo(() => {
    return props.types.map(t => ({ key: t.name, text: t.description }));
  }, [props.targets]);

  const updateType = (_e, option?: IDropdownOption) => {
    const type = props.types.find(t => t.name === option?.key);

    if (type) {
      setTargetType(type.name);
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

  const instructions: string | undefined = useMemo((): string | undefined => {
    return targetType ? props.types.find(t => t.name === targetType)?.instructions : '';
  }, [props.targets, targetType]);

  const schema = useMemo(() => {
    return targetType ? props.types.find(t => t.name === targetType)?.schema : undefined;
  }, [props.targets, targetType]);

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
      await props.updateSettings(name, targetType, JSON.stringify(config) || '{}');
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
          defaultSelectedKey={props.current ? props.current.type : null}
          onChange={updateType}
        />
        {instructions && <p>{instructions}</p>}
        <div css={label}>{formatMessage('Publish Configuration')}</div>
        <JsonEditor key={targetType} onChange={updateConfig} height={200} value={config} schema={schema} />
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
