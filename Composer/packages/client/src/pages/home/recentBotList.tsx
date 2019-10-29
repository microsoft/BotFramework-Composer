/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
import { Fragment } from 'react';
import moment from 'moment';

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
      onRender: item => {
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
      onRender: item => {
        return <span>{calculateTimeDiff(item.dateModified)}</span>;
      },
      isPadded: true,
    },
  ];

  const calculateTimeDiff = (time: any) => {
    return moment(time).toNow();
  };

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

  const selection = new Selection({
    onSelectionChanged: () => {
      const file = selection.getSelection()[0];
      // selected item will be cleaned when folder path changed file will be undefine
      // when no item selected.
      onSelectionChanged(file);
    },
  });

  return (
    <Fragment>
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
            selection={selection}
            selectionMode={SelectionMode.single}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}
