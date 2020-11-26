// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DetailsList, IColumn, CheckboxVisibility } from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import moment from 'moment';
import { useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';

import { listRoot, tableView, detailList } from './styles';

export interface IStatusListProps {
  items: IStatus[];
  isRollbackSupported: boolean;
  onLogClick: (item: IStatus) => void;
  onRollbackClick: (item: IStatus) => void;
  updateItems: (items: IStatus[]) => void;
}

export interface IStatus {
  id: string;
  time: string;
  status: number;
  message: string;
  comment: string;
  action?: {
    href: string;
    label: string;
  };
}

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

export const PublishStatusList: React.FC<IStatusListProps> = (props) => {
  const { items, isRollbackSupported, onLogClick, onRollbackClick } = props;
  const [currentSort, setSort] = useState({ key: 'PublishDate', descending: true });
  const sortByDate = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted && items) {
      column.isSortedDescending = !column.isSortedDescending;
      const newItems: IStatus[] = items.slice().reverse();
      props.updateItems(newItems);
    }
  };
  const columns = [
    {
      key: 'PublishTime',
      name: formatMessage('Time'),
      className: 'publishTime',
      fieldName: 'time',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{moment(item.time).format('h:mm a')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: formatMessage('Date'),
      className: 'publishDate',
      fieldName: 'date',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      onColumnClick: sortByDate,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{moment(item.time).format('MM-DD-YYYY')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: formatMessage('Status'),
      className: 'publishStatus',
      fieldName: 'status',
      minWidth: 40,
      maxWidth: 40,
      isResizable: true,
      data: 'string',
      onRender: (item: IStatus) => {
        if (item.status === 200) {
          return <Icon iconName="Accept" style={{ color: SharedColors.green10, fontWeight: 600 }} />;
        } else if (item.status === 202) {
          return (
            <div style={{ display: 'flex' }}>
              <Spinner size={SpinnerSize.small} />
            </div>
          );
        } else {
          return <Icon iconName="Cancel" style={{ color: SharedColors.red10, fontWeight: 600 }} />;
        }
      },
      isPadded: true,
    },
    {
      key: 'PublishMessage',
      name: formatMessage('Message'),
      className: 'publishMessage',
      fieldName: 'message',
      minWidth: 150,
      maxWidth: 300,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return (
          <span>
            {item.message}
            {item.action && (
              <Link
                aria-label={item.action.label}
                href={item.action.href}
                rel="noopener noreferrer"
                style={{ marginLeft: '3px' }}
                target="_blank"
              >
                {item.action.label}
              </Link>
            )}
          </span>
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: formatMessage('Comment'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{item.comment}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishLog',
      name: '',
      className: 'publishLog',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return (
          <ActionButton
            allowDisabledFocus
            styles={{ root: { color: '#0078D4' } }}
            onClick={() => {
              onLogClick(item);
            }}
          >
            {formatMessage('View log')}
          </ActionButton>
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishRollback',
      name: '',
      className: 'publishRollback',
      fieldName: 'publishRollback',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return (
          <ActionButton
            allowDisabledFocus
            disabled={!(isRollbackSupported && item.status === 200)}
            styles={{ root: { color: '#0078D4' } }}
            onClick={() => {
              onRollbackClick(item);
            }}
          >
            {formatMessage('Rollback')}
          </ActionButton>
        );
      },
      isPadded: true,
    },
  ];

  return (
    <div css={listRoot} data-testid={'publish-status-list'}>
      <div css={tableView}>
        <DetailsList
          isHeaderVisible
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns.map((col) => ({
            ...col,
            isSorted: col.key === currentSort.key,
            isSortedDescending: currentSort.descending,
          }))}
          css={detailList}
          items={items}
          styles={{ root: { selectors: { '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' } } } }}
          onColumnHeaderClick={(_, clickedCol) => {
            if (!clickedCol) return;
            if (clickedCol.key === currentSort.key) {
              clickedCol.isSortedDescending = !currentSort.descending;
              setSort({ key: clickedCol.key, descending: !currentSort.descending });
            } else {
              clickedCol.isSorted = false;
            }
          }}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </div>
    </div>
  );
};
