// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn, FontIcon } from 'office-ui-fabric-react';

import { INotification } from './types';
import { notification, typeIcon } from './styles';

export interface INotificationListProps {
  items: INotification[];
}

const icons = {
  Error: { iconName: 'ErrorBadge', color: '#A80000', background: '#FED9CC' },
  Warning: { iconName: 'Warning', color: '#8A8780', background: '#FFF4CE' },
};

const columns: IColumn[] = [
  {
    key: 'column1',
    name: 'Icon',
    className: notification.typeIconCell,
    iconClassName: notification.typeIconHeaderIcon,
    fieldName: 'icon',
    minWidth: 16,
    maxWidth: 16,
    onRender: (item: INotification) => {
      return <FontIcon iconName={icons[item.type].iconName} css={typeIcon(icons[item.type])} />;
    },
  },
  {
    key: 'column2',
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
    key: 'column3',
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
    key: 'column4',
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
    <DetailsList
      items={items}
      columns={columns}
      selectionMode={SelectionMode.none}
      setKey="none"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
    />
  );
};
