// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useState } from 'react';
import formatMessage from 'format-message';
import { TextField, DialogFooter, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';

interface ImportDialogProps {
  closeDialog: () => void;
  doImport: (packageName: string, version: string | undefined, isUpdating: boolean, source?: string) => void;
  name?: string;
  version?: string;
}

const ImportDialog: React.FC<ImportDialogProps> = (props) => {
  const [name, setName] = useState(props.name || '');
  const [version, setVersion] = useState(props.version || '');

  const isDisable = () => {
    if (!name) {
      return true;
    } else {
      return false;
    }
  };
  const updateName = (e, val) => {
    setName(val);
  };
  const updateVersion = (e, val) => {
    setVersion(val);
  };
  const submit = (e) => {
    e?.preventDefault();
    props.doImport(name, version, false);
    return false;
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <TextField
          required
          defaultValue={props.name || ''}
          label={formatMessage('Package Name')}
          placeholder={formatMessage('super-dialog-bundle')}
          onChange={updateName}
        />
        <TextField
          defaultValue={props.version || ''}
          label={formatMessage('Version (optional)')}
          placeholder={formatMessage('1.0.0')}
          onChange={updateVersion}
        />
        <DialogFooter>
          <DefaultButton onClick={props.closeDialog}>{formatMessage('Cancel')}</DefaultButton>
          <PrimaryButton disabled={isDisable()} text={formatMessage('Import')} type="submit" onClick={submit} />
        </DialogFooter>
      </form>
    </Fragment>
  );
};

export { ImportDialog };
