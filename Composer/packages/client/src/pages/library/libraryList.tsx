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
import moment from 'moment';
import { useState } from 'react';

import { listRoot, tableView, detailList } from './styles';

export interface ILibraryListProps {
  items: LibraryItem[];
  // onItemClick: (item: IStatus | null) => void;
  // updateItems: (items: IStatus[]) => void;
}

export interface LibraryItem {
  name: string;
  lastImported: Date;
  url: string;
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

export const LibraryList: React.FC<ILibraryListProps> = (props) => {
  const { items } = props;
  const [currentSort, setSort] = useState({ key: 'ItemName', descending: true });
  const sortByDate = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted) {
      column.isSortedDescending = !column.isSortedDescending;
      // const newItems: LibraryItem[] = [];
      // props.updateItems(newItems);
    }
  };
  const columns = [
    {
      key: 'ItemName',
      name: 'Name',
      // className: 'publishdate',
      fieldName: 'name',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      onColumnClick: sortByDate,
      data: 'string',
      onRender: (item: LibraryItem) => {
        return <span>{item.name}</span>;
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
      onColumnClick: sortByDate,
      data: 'string',
      onRender: (item: LibraryItem) => {
        return <span>{moment(item.lastImported).format('MM-DD-YYYY')}</span>;
      },
      isPadded: true,
    },
  ];

  return (
    <div css={listRoot}>
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
          getKey={(item) => item.id}
          groupProps={{
            showEmptyGroups: true,
          }}
          items={items}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          setKey="none"
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
