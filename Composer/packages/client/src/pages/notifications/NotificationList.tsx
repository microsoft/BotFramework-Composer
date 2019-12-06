// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';

import { INotification } from './types';
import { notification, typeIcon, listRoot, icons } from './styles';

export interface INotificationListProps {
  items: INotification[];
  onItemClick: (item: INotification) => void;
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
      const icon = icons[item.severity];
      return <FontIcon iconName={icon.iconName} css={typeIcon(icon)} />;
    },
  },
  {
    key: 'Notification Type',
    name: 'Type',
    className: notification.columnCell,
    fieldName: 'type',
    minWidth: 70,
    maxWidth: 90,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: INotification) => {
      return <span>{item.severity}</span>;
    },
    isPadded: true,
  },
  {
    key: 'Notification Location',
    name: 'Location',
    className: notification.columnCell,
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
    className: notification.columnCell,
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
  const { items, onItemClick } = props;

  const selection = new Selection({
    onSelectionChanged: () => {
      const item = selection.getSelection()[0] as INotification;
      // selected item will be cleaned when folder path changed file will be undefine
      // when no item selected.
      onItemClick(item);
    },
  });

  return (
    <div css={listRoot} data-testid="notifications-table-view">
      <DetailsList
        items={items}
        columns={columns}
        selection={selection}
        selectionMode={SelectionMode.single}
        setKey="none"
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        checkboxVisibility={CheckboxVisibility.hidden}
      />
    </div>
  );
};
