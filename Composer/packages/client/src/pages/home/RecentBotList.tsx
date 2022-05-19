// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Link } from '@fluentui/react/lib/Link';
import { Sticky, StickyPositionType } from '@fluentui/react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from '@fluentui/react/lib/ScrollablePane';
import { IObjectWithKey } from '@fluentui/react/lib/MarqueeSelection';
import { DetailsList, DetailsListLayoutMode, SelectionMode, CheckboxVisibility } from '@fluentui/react/lib/DetailsList';
import formatMessage from 'format-message';
import { useMemo } from 'react';

import { calculateTimeDiff } from '../../utils/fileUtil';

import * as home from './styles';

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
      data: 'string',
      onRender: (item) => {
        return (
          <div data-is-focusable css={home.tableCell}>
            <Link
              aria-label={formatMessage(`Bot name is {botName}`, { botName: item.name })}
              onClick={() => onItemChosen(item)}
            >
              {item.name}
            </Link>
          </div>
        );
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: formatMessage('Location'),
      fieldName: 'path',
      minWidth: 200,
      maxWidth: 400,
      isResizable: true,
      data: 'string',
      onRender: (item) => {
        return (
          <div data-is-focusable css={home.tableCell}>
            <div
              aria-label={formatMessage(`location is {location}`, { location: item.path })}
              css={home.content}
              tabIndex={-1}
            >
              {item.path}
            </div>
          </div>
        );
      },
      isPadded: true,
    },
    {
      key: 'column3',
      name: formatMessage('Date modified'),
      fieldName: 'dateModifiedValue',
      minWidth: 60,
      maxWidth: 70,
      isResizable: true,
      data: 'number',
      onRender: (item) => {
        return (
          <div data-is-focusable css={home.tableCell}>
            <div
              aria-label={formatMessage(`Last modified time is {time}`, { time: calculateTimeDiff(item.dateModified) })}
              css={home.content}
              tabIndex={-1}
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
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  const botList = useMemo(() => {
    return (
      <DetailsList
        isHeaderVisible
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={tableColums}
        compact={false}
        getKey={(item) => `${item.path}/${item.name}`}
        items={recentProjects}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
        onItemInvoked={onItemChosen}
        onRenderDetailsHeader={onRenderDetailsHeader}
      />
    );
  }, [recentProjects]);

  return (
    <div css={home.detailListContainer} data-is-scrollable="true">
      {recentProjects.length > 5 ? (
        <div css={home.detailListScrollWrapper}>
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>{botList}</ScrollablePane>{' '}
        </div>
      ) : (
        botList
      )}
    </div>
  );
}
