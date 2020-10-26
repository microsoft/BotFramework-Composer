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
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';

import { Pagination } from '../../components/Pagination';
import { diagnosticsSelector } from '../../recoilModel/selectors/diagnosticsPageSelector';

import { INotification } from './types';

// -------------------- Styles -------------------- //

const icons = {
  Error: { iconName: 'ErrorBadge', color: '#A80000', background: '#FED9CC' },
  Warning: { iconName: 'Warning', color: '#8A8780', background: '#FFF4CE' },
};

const notification = mergeStyleSets({
  typeIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  typeIconCell: {
    textAlign: 'center',
    cursor: 'pointer',
  },
  columnCell: {
    cursor: 'pointer',
  },
});

const typeIcon = (icon) => css`
  vertical-align: middle;
  font-size: 16px;
  width: 24px;
  height: 24px;
  background: ${icon.background};
  line-height: 24px;
  color: ${icon.color};
  cursor: pointer;
`;

const listRoot = css`
  position: relative;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const tableView = css`
  position: relative;
  flex-grow: 1;
`;

const detailList = css`
  overflow-x: hidden;
`;

const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

const content = css`
  outline: none;
`;

// -------------------- NotificationList -------------------- //
export interface INotificationListProps extends RouteComponentProps {
  projectId?: string;
  showType: string;
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
      return <FontIcon css={typeIcon(icon)} iconName={icon.iconName} />;
    },
  },
  {
    key: 'NotificationType',
    name: formatMessage('Type'),
    className: notification.columnCell,
    fieldName: 'type',
    minWidth: 70,
    maxWidth: 90,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: INotification) => {
      return (
        <div data-is-focusable css={tableCell}>
          <div
            aria-label={formatMessage(`This is a {severity} notification`, { severity: item.severity })}
            css={content}
            tabIndex={-1}
          >
            {item.severity}
          </div>
        </div>
      );
    },
    isPadded: true,
  },
  {
    key: 'NotificationLocation',
    name: formatMessage('Location'),
    className: notification.columnCell,
    fieldName: 'location',
    minWidth: 70,
    maxWidth: 90,
    isResizable: true,
    data: 'string',
    onRender: (item: INotification) => {
      return (
        <div data-is-focusable css={tableCell}>
          <div
            aria-label={formatMessage(`location is {location}`, { location: item.location })}
            css={content}
            tabIndex={-1}
          >
            {item.location}
          </div>
        </div>
      );
    },
    isPadded: true,
  },
  {
    key: 'NotificationDetail',
    name: formatMessage('Message'),
    className: notification.columnCell,
    fieldName: 'message',
    minWidth: 70,
    maxWidth: 90,
    isResizable: true,
    isCollapsible: true,
    isMultiline: true,
    data: 'string',
    onRender: (item: INotification) => {
      return (
        <div data-is-focusable css={tableCell}>
          <div
            aria-label={formatMessage(`Notification Message {msg}`, { msg: item.message })}
            css={content}
            tabIndex={-1}
          >
            {item.message}
          </div>
        </div>
      );
    },
    isPadded: true,
  },
];

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

export const NotificationList: React.FC<INotificationListProps> = (props) => {
  const { onItemClick, projectId = '', showType } = props;
  const notifications = useRecoilValue(diagnosticsSelector(projectId));
  const availableNotifications = showType ? notifications.filter((x) => x.severity === showType) : notifications;
  const [pageIndex, setPageIndex] = useState<number>(1);

  const pageCount: number = useMemo(() => {
    return Math.ceil(availableNotifications.length / itemCount) || 1;
  }, [availableNotifications]);

  const showItems = availableNotifications.slice((pageIndex - 1) * itemCount, pageIndex * itemCount);

  return (
    <div css={listRoot} data-testid="notifications-table-view" role="main">
      <div aria-label={formatMessage('Notification list')} css={tableView} role="region">
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            isHeaderVisible
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={columns}
            css={detailList}
            items={showItems}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            setKey="none"
            onItemInvoked={onItemClick}
            onRenderDetailsHeader={onRenderDetailsHeader}
          />
        </ScrollablePane>
      </div>
      <Pagination pageCount={pageCount} onChange={setPageIndex} />
    </div>
  );
};
