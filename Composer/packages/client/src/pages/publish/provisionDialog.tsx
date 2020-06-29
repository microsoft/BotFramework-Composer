// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, Fragment, useMemo } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { PublishTarget, PublishType } from '../../store/types';
// import { Subscription } from '../../store/types';
// import { getAccessTokenInCache } from '../../utils/auth';
interface ProvisionDialogProps {
  onDismiss: () => void;
  onSubmit: (value: any) => void;
  types: PublishType[];
  targets: PublishTarget[];
  current: PublishTarget | null;
}

export const ProvisionDialog: React.FC<ProvisionDialogProps> = (props) => {
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<string | undefined>(props.current?.type);
  const [dialogProps, setDialogProps] = useState(
    props.current
      ? { keytitle: formatMessage('Edit a publish profile'), type: DialogType.normal }
      : { keytitle: formatMessage('Add a publish profile'), type: DialogType.normal }
  );
  const [errorMessage, setErrorMsg] = useState('');

  const targetTypes = useMemo(() => {
    return props.types.map((t) => ({ key: t.name, text: t.description }));
  }, [props.targets]);

  const updateName = useMemo(
    () => (e, newName) => {
      setErrorMsg('');
      setName(newName);
      isNameValid(newName);
    },
    []
  );
  const isNameValid = useMemo(
    () => (newName) => {
      if (!newName || newName.trim() === '') {
        setErrorMsg(formatMessage('Must have a name'));
      } else {
        const exists = !!props.targets?.find((t) => t.name.toLowerCase() === newName?.toLowerCase);

        if (exists) {
          setErrorMsg(formatMessage('A profile with that name already exists.'));
        }
      }
    },
    [props.targets]
  );

  const updateType = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const type = props.types.find((t) => t.name === option?.key);

      if (type) {
        setTargetType(type.name);
      }
    },
    [props.types]
  );

  const isDisable = useMemo(
    () => () => {
      if (!targetType || !name || errorMessage) {
        return true;
      } else {
        return false;
      }
    },
    [targetType, name, errorMessage]
  );

  return (
    <Dialog
      dialogContentProps={dialogProps}
      hidden={false}
      minWidth={450}
      modalProps={{ isBlocking: true }}
      onDismiss={props.onDismiss}
    >
      <Fragment>
        <form>
          <TextField
            defaultValue={props.current ? props.current.name : ''}
            errorMessage={errorMessage}
            label={formatMessage('Name')}
            placeholder={formatMessage('My Publish Profile')}
            onChange={updateName}
          />
          <Dropdown
            defaultSelectedKey={props.current ? props.current.type : null}
            label={formatMessage('Publish Destination Type')}
            options={targetTypes}
            placeholder={formatMessage('Choose One')}
            onChange={updateType}
          />
        </form>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
          <PrimaryButton
            disabled={isDisable()}
            text={formatMessage('Next')}
            onClick={async () => {
              props.onDismiss();
              await props.onSubmit({ name: name, type: targetType });
            }}
          />
        </DialogFooter>
      </Fragment>
    </Dialog>
  );
};
