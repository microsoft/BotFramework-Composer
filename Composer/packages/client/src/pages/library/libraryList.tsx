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
  IGroup,
} from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import moment from 'moment';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { LibraryRef } from '@bfc/shared';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { listRoot, tableView, detailList } from './styles';

export interface ILibraryListProps {
  items: LibraryRef[];
  groups: IGroup[];
  redownload: (evt: any) => void;
  install: (evt: any) => void;
  isInstalled: (item: LibraryRef) => boolean;
  removeLibrary: (evt: any) => void;
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
  const { items, groups } = props;
  const [selectIndex, setSelectedIndex] = useState<number>();
  const [currentSort, setSort] = useState({ key: 'ItemName', descending: true });

  const onRenderOverflowButton = (overflowItems: any[] | undefined) => {
    return (
      <IconButton
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems! }}
        role="menuitem"
        title="More options"
      />
    );
  };
  const onRenderItem = (item: IOverflowSetItemProps) => {
    const { name, key } = item;
    return <div key={key}>{name}</div>;
  };

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
        if (item.lastImported) {
          return <span>{moment(item.lastImported).format('MM-DD-YYYY')}</span>;
        } else {
          return '';
        }
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
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return (
          <Fragment>
            {props.isInstalled(item) && (
              <OverflowSet
                overflowItems={[
                  {
                    key: 'Update',
                    name: 'Update',
                    onClick: () => props.redownload(item),
                  },
                  {
                    key: 'remove',
                    name: 'Remove',
                    onClick: () => props.removeLibrary(item),
                  },
                ]}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
              />
            )}
            {!props.isInstalled(item) && (
              <Fragment>
                <DefaultButton text={formatMessage('Install')} onClick={props.install} />
              </Fragment>
            )}
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
          groups={groups}
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
