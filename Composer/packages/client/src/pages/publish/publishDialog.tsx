// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, Fragment } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { publishDialogText } from './styles';

export const PublishDialog = (props) => {
  const [comment, setComment] = useState('');
  const publishDialogProps = {
    title: formatMessage('Publish'),
    type: DialogType.normal,
    subText: formatMessage('You are about to publish your bot to the profile below. Do you want to proceed?'),
  };
  const submit = async () => {
    props.onDismiss();
    await props.onSubmit(comment);
  };
  return props.target ? (
    <Dialog
      dialogContentProps={publishDialogProps}
      hidden={false}
      modalProps={{ isBlocking: true }}
      onDismiss={props.onDismiss}
    >
      <Fragment>
        <div css={publishDialogText}>{props.target.name}</div>
        <form onSubmit={submit}>
          <TextField
            multiline
            label={formatMessage('Comment')}
            // styles={styles.textarea}
            placeholder={formatMessage('Provide a brief description. It will appear on the publish history list.')}
            onChange={(e, newvalue) => setComment(newvalue || '')}
          />
        </form>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
          <PrimaryButton text={formatMessage('Okay')} onClick={submit} />
        </DialogFooter>
      </Fragment>
    </Dialog>
  ) : null;
};
