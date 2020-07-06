// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { LgTemplate } from '@bfc/shared';

import { StoreContext } from '../../store';
import { increaseNameUtilNotExist } from '../../utils/lgUtil';
import { navigateTo } from '../../utils/navigation';
import { actionButton, formCell, content } from '../language-understanding/styles';

interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { dialogs, lgFiles, projectId, locale } = state;
  const { dialogId } = props;
  const file = lgFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const createLgTemplate = useRef(debounce(actions.createLgTemplate, 500)).current;
  const copyLgTemplate = useRef(debounce(actions.copyLgTemplate, 500)).current;
  const removeLgTemplate = useRef(debounce(actions.removeLgTemplate, 500)).current;
  const [templates, setTemplates] = useState<LgTemplate[]>([]);
  const listRef = useRef(null);

  const activeDialog = dialogs.find(({ id }) => id === dialogId);

  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!file || isEmpty(file)) return;

    setTemplates(file.templates);
  }, [file, activeDialog, projectId]);

  const moreLabel = formatMessage('Actions');

  const onClickEdit = useCallback(
    (template: LgTemplate) => {
      const { name } = template;
      navigateTo(`/bot/${projectId}/language-generation/${dialogId}/edit?t=${encodeURIComponent(name)}`);
    },
    [dialogId, projectId]
  );

  const onCreateNewTemplate = useCallback(() => {
    const newName = increaseNameUtilNotExist(templates, 'TemplateName');
    const payload = {
      file,
      projectId,
      template: {
        name: newName,
        body: '-TemplateValue',
      },
    };
    createLgTemplate(payload);
    setFocusedIndex(templates.length);
  }, [templates, file, projectId]);

  const onRemoveTemplate = useCallback(
    (index) => {
      const payload = {
        file,
        projectId,
        templateName: templates[index].name,
      };

      removeLgTemplate(payload);
    },
    [templates, file, projectId]
  );

  const onCopyTemplate = useCallback(
    (index) => {
      const name = templates[index].name;
      const resolvedName = increaseNameUtilNotExist(templates, `${name}_Copy`);
      const payload = {
        file,
        projectId,
        fromTemplateName: name,
        toTemplateName: resolvedName,
      };
      copyLgTemplate(payload);
      setFocusedIndex(templates.length);
    },
    [templates, file, projectId]
  );

  const getTemplatesMoreButtons = useCallback(
    (item, index) => {
      const buttons = [
        {
          key: 'edit',
          name: formatMessage('Edit'),
          onClick: () => {
            onClickEdit(templates[index]);
          },
        },
        {
          key: 'delete',
          name: formatMessage('Delete'),
          onClick: () => {
            actions.setMessage('item deleted');
            onRemoveTemplate(index);
          },
        },
        {
          key: 'copy',
          name: formatMessage('Make a copy'),
          onClick: () => {
            actions.setMessage('item copied');
            onCopyTemplate(index);
          },
        },
      ];

      return buttons;
    },
    [activeDialog, templates]
  );

  const getTableColums = useCallback(() => {
    const tableColums = [
      {
        key: 'name',
        name: formatMessage('Name'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div aria-label={formatMessage(`Name is {name}`, { name: item.name })} css={content} tabIndex={-1}>
                #{item.name}
              </div>
            </div>
          );
        },
      },
      {
        key: 'responses',
        name: formatMessage('Responses'),
        fieldName: 'responses',
        minWidth: 500,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Response is {response}`, { response: item.body })}
                css={content}
                tabIndex={-1}
              >
                {item.body}
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
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, index) => {
          return (
            <TooltipHost calloutProps={{ gapSpace: 10 }} content={moreLabel}>
              <IconButton
                ariaLabel={moreLabel}
                menuIconProps={{ iconName: 'MoreVertical' }}
                menuProps={{
                  shouldFocusOnMount: true,
                  items: getTemplatesMoreButtons(item, index),
                }}
                styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
              />
            </TooltipHost>
          );
        },
      },
    ];

    // all view, show used in column
    if (activeDialog) {
      const beenUsedColumn = {
        key: 'beenUsed',
        name: formatMessage('Been used'),
        fieldName: 'beenUsed',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return activeDialog?.lgTemplates.find(({ name }) => name === item.name) ? (
            <Icon
              ariaLabel={formatMessage('Used') + ';'}
              iconName={'Accept'}
              styles={{
                root: {
                  fontSize: '16px',
                  paddingTop: '8px',
                },
              }}
            />
          ) : (
            <div data-is-focusable aria-label={formatMessage('Unused') + ';'} />
          );
        },
      };
      tableColums.splice(2, 0, beenUsedColumn);
    }

    return tableColums;
  }, [activeDialog, templates, projectId]);

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

  const onRenderDetailsFooter = useCallback(() => {
    // do not allow add template in particular dialog lg, it suppose to be auto generated in form.
    if (activeDialog) return <div />;

    return (
      <div data-testid="tableFooter">
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => {
            onCreateNewTemplate();
            actions.setMessage('item added');
          }}
        >
          {formatMessage('New template')}
        </ActionButton>
      </div>
    );
  }, [activeDialog, templates]);

  const getKeyCallback = useCallback((item) => item.name, []);

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          componentRef={listRef}
          getKey={getKeyCallback}
          initialFocusedIndex={focusedIndex}
          items={templates}
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
          onRenderDetailsFooter={onRenderDetailsFooter}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
