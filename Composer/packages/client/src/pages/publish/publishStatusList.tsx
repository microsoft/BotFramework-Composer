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

import { listRoot, tableView, detailList } from './styles';

export interface IStatusListProps {
  items: IStatus[];
  groups: IGroup[];
  onItemClick: (item: IStatus) => void;
}
export enum PublishStatus {
  Success,
  Loading,
  Failure,
}

export interface IStatus {
  // id: string;
  time: string;
  status: PublishStatus;
  message: string;
  comment: string;
}

const columns: IColumn[] = [
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
      return <span>{item.time}</span>;
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
      return <span>{item.status}</span>;
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

  const selection = new Selection({
    onSelectionChanged: () => {
      const items = selection.getSelection();
      if (items.length) {
        onItemClick(items[0] as IStatus);
      }
    },
  });

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
