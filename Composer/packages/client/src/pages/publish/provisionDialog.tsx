// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, Fragment } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

export const ProvisionDialog = (props) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Dialog hidden={false} modalProps={{ isBlocking: true }} onDismiss={props.onDismiss}>
      <Fragment>
        <form>
          <TextField
            required
            label={formatMessage('Name')}
            placeholder="Publish Name"
            onChange={(e, newvalue) => setName(newvalue || '')}
          />
          <TextField
            required
            label={formatMessage('PassWord')}
            placeholder="Password"
            onChange={(e, newvalue) => setPassword(newvalue || '')}
          />
        </form>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
          <PrimaryButton
            text={formatMessage('Okay')}
            onClick={async () => {
              props.onDismiss();
              await props.onSubmit({ name: name, password: password });
            }}
          />
        </DialogFooter>
      </Fragment>
    </Dialog>
  );
};
