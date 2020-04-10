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
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { useMemo, useState } from 'react';

import { Pagination } from '../../components/Pagination';

import { INotification } from './types';
import { notification, typeIcon, listRoot, icons, tableView, detailList } from './styles';

export interface INotificationListProps {
  items: INotification[];
  onItemClick: (item: INotification) => void;
}

const itemCount = 10;

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
    key: 'NotificationType',
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
    key: 'NotificationLocation',
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
    key: 'NotificationDetail',
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

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

export const NotificationList: React.FC<INotificationListProps> = props => {
  const { items, onItemClick } = props;
  const [pageIndex, setPageIndex] = useState<number>(1);

  const pageCount: number = useMemo(() => {
    return Math.ceil(items.length / itemCount) || 1;
  }, [items]);

  const showItems = items.slice((pageIndex - 1) * itemCount, pageIndex * itemCount);

  return (
    <div css={listRoot} data-testid="notifications-table-view">
      <div css={tableView}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            css={detailList}
            items={showItems}
            columns={columns}
            onItemInvoked={onItemClick}
            selectionMode={SelectionMode.single}
            setKey="none"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            checkboxVisibility={CheckboxVisibility.hidden}
            onRenderDetailsHeader={onRenderDetailsHeader}
          />
        </ScrollablePane>
      </div>
      <Pagination pageCount={pageCount} onChange={setPageIndex} />
    </div>
  );
};
