// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  IGroup,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import moment from 'moment';
import { useMemo, useState, useEffect } from 'react';

import { listRoot, tableView, detailList } from './styles';

export interface IStatusListProps {
  items: IStatus[];
  groups: IGroup[];
  onItemClick: (item: IStatus | null) => void;
  updateItems: (items: IStatus[]) => void;
}

export interface IStatus {
  id: string;
  time: string;
  status: number;
  message: string;
  comment: string;
}

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

export const PublishStatusList: React.FC<IStatusListProps> = props => {
  const { items, onItemClick, groups } = props;
  const [selectIndex, setSelectedItem] = useState();
  const sortByDate = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted) {
      column.isSortedDescending = !column.isSortedDescending;
      let newItems: IStatus[] = [];
      for (const group of groups) {
        newItems = newItems.concat(items.slice(group.startIndex, group.startIndex + group.count).reverse());
      }
      props.updateItems(newItems);
    }
  };
  const columns = [
    {
      key: 'PublishTime',
      name: 'Time',
      className: 'publishtime',
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
      name: 'Date',
      className: 'publishdate',
      fieldName: 'date',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: true,
      onColumnClick: sortByDate,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{moment(item.time).format('DD-MM-YYYY')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: 'Status',
      className: 'publishstatus',
      fieldName: 'status',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      onRender: (item: IStatus) => {
        if (item.status === 200) {
          return <Icon iconName="Accept" style={{ color: 'green', fontWeight: 600 }} />;
        } else if (item.status === 202) {
          return (
            <div style={{ display: 'flex' }}>
              <Spinner size={SpinnerSize.small} />
            </div>
          );
        } else {
          return <Icon iconName="Cancel" style={{ color: 'red', fontWeight: 600 }} />;
        }
      },
      isPadded: true,
    },
    {
      key: 'PublishMessage',
      name: 'Message',
      className: 'publishmessage',
      fieldName: 'message',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{item.message}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: 'Comment',
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
  ];
  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedIndexs = selection.getSelectedIndices();
        if (selectedIndexs.length > 0) {
          setSelectedItem(selectedIndexs[0]);
        }
      },
    });
  }, [items, groups]);

  useEffect(() => {
    if (items && items.length > selectIndex) {
      onItemClick(items[selectIndex]);
    } else {
      onItemClick(null);
    }
  }, [selectIndex, items]);

  return (
    <div css={listRoot}>
      <div css={tableView}>
        <DetailsList
          css={detailList}
          items={items}
          columns={columns}
          groups={groups}
          selection={selection}
          selectionMode={SelectionMode.single}
          getKey={item => item.id}
          setKey="none"
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          checkboxVisibility={CheckboxVisibility.hidden}
          onRenderDetailsHeader={onRenderDetailsHeader}
          groupProps={{
            showEmptyGroups: true,
          }}
        />
      </div>
    </div>
  );
};
