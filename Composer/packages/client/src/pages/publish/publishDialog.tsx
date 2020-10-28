// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';

import { IBotStatus } from './botStatusList';

export const PublishDialog = (props) => {
  const { items } = props;
  const columns = [
    {
      key: 'name',
      name: formatMessage('Bot'),
      className: 'botName',
      fieldName: 'name',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <div css={{ alignItems: 'center', display: 'flex', height: '32px' }}>{item.name}</div>;
      },
      isPadded: true,
    },
    {
      key: 'publishTarget',
      name: formatMessage('Publish target'),
      className: 'publishtarget',
      fieldName: 'publishTarget',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return (
          <div css={{ backgroundColor: '#DDF3DB', alignItems: 'center', display: 'flex', height: '32px' }}>
            {item.publishTarget}
          </div>
        );
      },
      isPadded: true,
    },
    {
      key: 'comment',
      name: formatMessage('Comments'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return (
          <TextField
            placeholder={formatMessage('Write your message')}
            value={item.comment}
            onChange={(e, newValue) => {
              item.comment = newValue;
            }}
          />
        );
      },
      isPadded: true,
    },
  ];
  const publishDialogProps = {
    title: formatMessage('Publish'),
    type: DialogType.normal,
    subText: formatMessage('You are about to publish your bot to the profile below. Do you want to proceed?'),
  };
  const submit = async () => {
    props.onDismiss();
    await props.onSubmit(items);
  };
  return items && items.length > 0 ? (
    <Dialog
      dialogContentProps={publishDialogProps}
      hidden={false}
      modalProps={{ isBlocking: true, styles: { main: { maxWidth: '1063px !important' } } }}
      onDismiss={props.onDismiss}
    >
      <Fragment>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns}
          items={items}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
        />

        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
          <PrimaryButton text={formatMessage('Okay')} onClick={submit} />
        </DialogFooter>
      </Fragment>
    </Dialog>
  ) : null;
};
