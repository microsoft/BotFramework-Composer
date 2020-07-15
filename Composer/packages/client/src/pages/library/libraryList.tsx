// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import moment from 'moment';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';

import { LibraryRef } from '../../store/types';

import { listRoot, tableView, detailList } from './styles';

export interface ILibraryListProps {
  items: LibraryRef[];
  redownload: (evt: any) => void;
  onItemClick: (item: LibraryRef | null) => void;
  updateItems: (items: LibraryRef[]) => void;
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
  const [selectIndex, setSelectedIndex] = useState<number>();
  const [currentSort, setSort] = useState({ key: 'ItemName', descending: true });
  const columns = [
    {
      key: 'ItemName',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return <span>{item.name}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: 'Date',
      fieldName: 'date',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return <span>{moment(item.lastImported).format('MM-DD-YYYY')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Version',
      name: 'Version',
      fieldName: 'version',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return <span>{item.version}</span>;
      },
      isPadded: true,
    },
    {
      key: 'actions',
      name: '',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return (
          <Fragment>
            <DefaultButton text={formatMessage('Update')} onClick={props.redownload} />
          </Fragment>
        );
      },
      isPadded: true,
    },
  ];

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedIndexs = selection.getSelectedIndices();
        if (selectedIndexs.length > 0) {
          setSelectedIndex(selectedIndexs[0]);
        }
      },
    });
  }, [items]);

  useEffect(() => {
    if (items && typeof selectIndex === 'number' && items.length > selectIndex) {
      props.onItemClick(items[selectIndex]);
    } else {
      props.onItemClick(null);
    }
  }, [selectIndex, items]);

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
          selection={selection}
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
