// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import get from 'lodash/get';

import { StoreContext } from '../../store';
import { formCell, content } from '../language-understanding/styles';
import { navigateTo } from '../../utils/navigation';
interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogs, qnaFiles, projectId, locale } = state;
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);

  const generateQnAPairs = (file) => {
    return get(file, 'qnaPairs', []).map((qnaPair, index) => {
      const qnaDialog = dialogs.find((dialog) => file.id === `${dialog.id}.${locale}`);
      return {
        fileId: file.fileId,
        dialogId: qnaDialog?.id || '',
        used: !!qnaDialog && qnaDialog,
        indexId: index,
        ...qnaPair,
      };
    });
  };
  const allQnAPairs = qnaFiles.reduce((result: any[], qnaFile) => {
    const res = generateQnAPairs(qnaFile);
    return result.concat(res);
  }, []);

  const singleFileQnAPairs = generateQnAPairs(file);
  const [qnaPairs, setQnaPairs] = useState(singleFileQnAPairs || allQnAPairs);
  const listRef = useRef(null);

  useEffect(() => {
    if (dialogId === 'all') {
      setQnaPairs(allQnAPairs);
    } else {
      setQnaPairs(singleFileQnAPairs);
    }
  }, [dialogId, projectId]);

  const getTemplatesMoreButtons = (item, index): IContextualMenuItem[] => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          const { dialogId, indexId } = qnaPairs[index];
          navigateTo(`/bot/${projectId}/qna/${dialogId}/edit?t=${indexId}`);
        },
      },
    ];
    return buttons;
  };

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
                aria-label={formatMessage(`Question is {question}`, { question: get(item, 'Questions[0]', '') })}
                css={content}
                tabIndex={-1}
              >
                {get(item, 'Questions[0]', '')}
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
                aria-label={formatMessage(`Alternatives are {alternatives}`, {
                  alternatives: get(item, 'Questions', []).slice(1).join('\n'),
                })}
                css={content}
                tabIndex={-1}
              >
                {get(item, 'Questions', []).slice(1).join('\n')}
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
      {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: false,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, index) => {
          return (
            <IconButton
              ariaLabel={formatMessage('Open inline editor')}
              menuIconProps={{ iconName: 'MoreVertical' }}
              menuProps={{
                shouldFocusOnMount: true,
                items: getTemplatesMoreButtons(item, index),
              }}
              styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
            />
          );
        },
      },
    ];

    // all view, show used in column
    if (!dialogId) {
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
  }, [dialogId, qnaPairs, projectId]);

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
