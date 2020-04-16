// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { IObjectWithKey } from 'office-ui-fabric-react/lib/MarqueeSelection';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';

import { calculateTimeDiff } from '../../utils';

import { detailListContainer } from './styles';

interface RecentBotListProps {
  onSelectionChanged: (file: IObjectWithKey) => void;
  recentProjects: any;
}
export function RecentBotList(props: RecentBotListProps): JSX.Element {
  const { onSelectionChanged, recentProjects } = props;
  // for detail file list in open panel
  const tableColums = [
    {
      key: 'column1',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item) => {
        return <span aria-label={item.name}>{item.name}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: formatMessage('Date Modified'),
      fieldName: 'dateModifiedValue',
      minWidth: 60,
      maxWidth: 70,
      isResizable: true,
      data: 'number',
      onRender: (item) => {
        return <span>{calculateTimeDiff(item.dateModified)}</span>;
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

  const selection = new Selection({
    onSelectionChanged: () => {
      const file = selection.getSelection()[0];
      // selected item will be cleaned when folder path changed file will be undefine
      // when no item selected.
      onSelectionChanged(file);
    },
  });

  return (
    <div css={detailListContainer} data-is-scrollable="true">
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={tableColums}
          compact={false}
          getKey={(item) => item.name}
          isHeaderVisible
          items={recentProjects}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={onRenderDetailsHeader}
          selection={selection}
          selectionMode={SelectionMode.single}
        />
      </ScrollablePane>
    </div>
  );
}
