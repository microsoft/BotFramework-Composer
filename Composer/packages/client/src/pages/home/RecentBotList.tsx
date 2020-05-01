// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
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

import { detailListContainer, tableCell, content } from './styles';

interface RecentBotListProps {
  onItemChosen: (file: IObjectWithKey) => void;
  recentProjects: any;
}
export function RecentBotList(props: RecentBotListProps): JSX.Element {
  const { onItemChosen, recentProjects } = props;
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
      onRender: item => {
        return (
          <div css={tableCell} data-is-focusable={true}>
            <div
              tabIndex={-1}
              css={content}
              aria-label={formatMessage(`Bot name is {botName}`, { botName: item.name })}
            >
              {item.name}
            </div>
          </div>
        );
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
      onRender: item => {
        return (
          <div css={tableCell} data-is-focusable={true}>
            <div
              tabIndex={-1}
              css={content}
              aria-label={formatMessage(`Last modified time is {time}`, { time: calculateTimeDiff(item.dateModified) })}
            >
              {calculateTimeDiff(item.dateModified)}
            </div>
          </div>
        );
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

  return (
    <div data-is-scrollable="true" css={detailListContainer}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          items={recentProjects}
          compact={false}
          columns={tableColums}
          getKey={item => item.name}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={onRenderDetailsHeader}
          isHeaderVisible={true}
          onItemInvoked={onItemChosen}
          selectionMode={SelectionMode.single}
          checkboxVisibility={CheckboxVisibility.hidden}
        />
      </ScrollablePane>
    </div>
  );
}
