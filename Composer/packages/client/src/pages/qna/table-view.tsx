// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import { formCell, content } from '../language-understanding/styles';

interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogs, qnaFiles, projectId, locale } = state;
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const allQnAPairs = qnaFiles.reduce((result, qnaFile) => {
    result = [...result, ...qnaFile.qnaPairs];
    return result;
  }, []);
  const [qnaPairs, setQnaPairs] = useState(file?.qnaPairs || allQnAPairs);
  const listRef = useRef(null);

  const activeDialog = dialogs.find(({ id }) => id === dialogId);

  //const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!file || isEmpty(file)) return;

    setQnaPairs(file.qnaPairs);
  }, [file, activeDialog, projectId]);

  const getTableColums = useCallback(() => {
    const tableColums = [
      {
        key: 'Question',
        name: formatMessage('Question'),
        fieldName: 'question',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Question is {question}`, { question: item.Questions.join('.\n') })}
                css={content}
                tabIndex={-1}
              >
                {item.Questions.join('.\n')}
              </div>
            </div>
          );
        },
      },
      {
        key: 'Alternatives',
        name: formatMessage('alternatives'),
        fieldName: 'alternatives',
        minWidth: 150,
        maxWidth: 150,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Alternatives are {alternatives}`, { alternatives: item.alternatives })}
                css={content}
                tabIndex={-1}
              >
                {item.alternatives}
              </div>
            </div>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('answer'),
        fieldName: 'answer',
        minWidth: 150,
        maxWidth: 350,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Answer is {answer}`, { answer: item.Answer })}
                css={content}
                tabIndex={-1}
              >
                {item.Answer}
              </div>
            </div>
          );
        },
      },
    ];

    // all view, show used in column
    if (!activeDialog) {
      const beenUsedColumn = {
        key: 'usedIn',
        name: formatMessage('Used In'),
        fieldName: 'usedIn',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div aria-label={formatMessage(`id is {id}`, { id: item.id })} css={content} tabIndex={-1}>
                {item.id}
              </div>
            </div>
          );
        },
      };
      tableColums.splice(3, 0, beenUsedColumn);
    }

    return tableColums;
  }, [activeDialog, qnaPairs, projectId]);

  const onRenderDetailsHeader = useCallback((props, defaultRender) => {
    return (
      <div data-testid="tableHeader">
        <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }, []);

  const getKeyCallback = useCallback((item) => item.name, []);

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          componentRef={listRef}
          getKey={getKeyCallback}
          initialFocusedIndex={0}
          items={qnaPairs}
          // getKey={item => item.name}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          styles={{
            root: {
              overflowX: 'hidden',
              // hack for https://github.com/OfficeDev/office-ui-fabric-react/issues/8783
              selectors: {
                'div[role="row"]:hover': {
                  background: 'none',
                },
              },
            },
          }}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
