// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment, useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { CheckboxVisibility, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';

import { IBotStatus } from './BotStatusList';

export const PublishDialog = (props) => {
  const { items } = props;
  const [showItems, setShowItems] = useState<IBotStatus[]>(items);
  const columns = [
    {
      key: 'name',
      name: formatMessage('Bot'),
      className: 'botName',
      fieldName: 'name',
      minWidth: 70,
      maxWidth: 90,
      isMultiline: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <span>{item.name}</span>;
      },
      isPadded: true,
    },
    {
      key: 'publishTarget',
      name: formatMessage('Publish target'),
      className: 'publishtarget',
      fieldName: 'publishTarget',
      minWidth: 180,
      maxWidth: 200,
      isMultiline: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <span>{item.publishTarget}</span>;
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
      data: 'string',
      onRender: (item: IBotStatus) => {
        // message for each publish bot
        return (
          <TextField
            placeholder={formatMessage('Write your message')}
            value={item.comment}
            onChange={(e, newValue) => {
              const newItems = showItems.map((obj) => {
                if (obj.id === item.id) {
                  obj.comment = newValue;
                }
                return obj;
              });
              setShowItems(newItems);
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
  const cleanComments = () => {
    const cleanedItems = showItems.map((item) => {
      item.comment = '';
      return item;
    });
    setShowItems(cleanedItems);
  };
  const submit = async () => {
    props.onDismiss();
    await props.onSubmit(showItems);
    cleanComments();
  };
  return showItems && showItems.length > 0 ? (
    <Dialog
      dialogContentProps={publishDialogProps}
      hidden={false}
      modalProps={{ isBlocking: true, styles: { main: { maxWidth: '1063px !important' } } }}
      onDismiss={() => {
        cleanComments();
        props.onDismiss();
      }}
    >
      <Fragment>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns}
          items={showItems}
          styles={{ root: { selectors: { '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' } } } }}
        />

        <DialogFooter>
          <DefaultButton
            text={formatMessage('Cancel')}
            onClick={() => {
              cleanComments();
              props.onDismiss();
            }}
          />
          <PrimaryButton text={formatMessage('Okay')} onClick={submit} />
        </DialogFooter>
      </Fragment>
    </Dialog>
  ) : null;
};
