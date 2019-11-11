// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn, FontIcon } from 'office-ui-fabric-react';

import { INotification } from './types';
import { notification, typeIcon, listRoot, icons } from './styles';

export interface INotificationListProps {
  items: INotification[];
}

const columns: IColumn[] = [
  {
    key: 'Icon',
    name: '',
    className: notification.typeIconCell,
    iconClassName: notification.typeIconHeaderIcon,
    fieldName: 'icon',
    minWidth: 30,
    maxWidth: 30,
    onRender: (item: INotification) => {
      return <FontIcon iconName={icons[item.type].iconName} css={typeIcon(icons[item.type])} />;
    },
  },
  {
    key: 'Notification Type',
    name: 'Type',
    fieldName: 'type',
    minWidth: 70,
    maxWidth: 90,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: INotification) => {
      return <span>{item.type}</span>;
    },
    isPadded: true,
  },
  {
    key: 'Notification Location',
    name: 'Location',
    fieldName: 'location',
    minWidth: 70,
    maxWidth: 90,
    isResizable: true,
    data: 'string',
    onRender: (item: INotification) => {
      return <span>{item.location}</span>;
    },
    isPadded: true,
  },
  {
    key: 'Notification Detail',
    name: 'Message',
    fieldName: 'message',
    minWidth: 70,
    maxWidth: 90,
    isResizable: true,
    isCollapsible: true,
    isMultiline: true,
    data: 'string',
    onRender: (item: INotification) => {
      return <span>{item.message}</span>;
    },
    isPadded: true,
  },
];

export const NotificationList: React.FC<INotificationListProps> = props => {
  const { items } = props;

  return (
    <div css={listRoot}>
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        setKey="none"
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
      />
    </div>
  );
};
