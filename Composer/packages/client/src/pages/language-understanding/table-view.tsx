// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useRef, useEffect, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { LuFile } from '@bfc/shared';

import { StoreContext } from '../../store';
import { navigateTo } from '../../utils/navigation';

import { formCell, luPhraseCell, tableCell, content } from './styles';
interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

interface Intent {
  name: string;
  phrases: string;
  fileId: string;
  dialogId: string;
  used: boolean;
  state: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, locale, projectId } = state;
  const { dialogId } = props;
  const activeDialog = dialogs.find(({ id }) => id === dialogId);

  const [intents, setIntents] = useState<Intent[]>([]);
  const listRef = useRef(null);

  const moreLabel = formatMessage('Open inline editor');

  function getIntentState(file: LuFile): string {
    if (!file.diagnostics) {
      return formatMessage('Error');
    } else if (!file.published) {
      return formatMessage('Not yet published');
    } else if (file.published) {
      return formatMessage('Published');
    } else {
      return formatMessage('Unknown State'); // It's a bug in most cases.
    }
  }

  useEffect(() => {
    if (isEmpty(luFiles)) return;

    const allIntents = luFiles.reduce((result: Intent[], luFile: LuFile) => {
      const items: Intent[] = [];
      const luDialog = dialogs.find((dialog) => luFile.id === `${dialog.id}.${locale}`);
      get(luFile, 'intents', []).forEach(({ Name: name, Body: phrases }) => {
        const state = getIntentState(luFile);

        items.push({
          name,
          phrases,
          fileId: luFile.id,
          dialogId: luDialog?.id || '',
          used: !!luDialog && luDialog.referredLuIntents.some((lu) => lu.name === name), // used by it's dialog or not
          state,
        });
      });
      return result.concat(items);
    }, []);

    if (!activeDialog) {
      setIntents(allIntents);
    } else {
      const dialogIntents = allIntents.filter((t) => t.dialogId === activeDialog.id);
      setIntents(dialogIntents);
    }
  }, [luFiles, activeDialog, projectId]);

  const getTemplatesMoreButtons = (item, index): IContextualMenuItem[] => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          const { name, dialogId } = intents[index];
          navigateTo(`/bot/${projectId}/language-understanding/${dialogId}/edit?t=${encodeURIComponent(name)}`);
        },
      },
    ];
    return buttons;
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'name',
        name: formatMessage('Intent'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 150,
        data: 'string',
        onRender: (item: Intent) => {
          let displayName = `#${item.name}`;
          if (item.name.includes('/')) {
            const [, childName] = item.name.split('/');
            displayName = `##${childName}`;
          }
          return (
            <div data-is-focusable css={formCell}>
              <div aria-label={formatMessage(`Name is {name}`, { name: displayName })} css={content} tabIndex={-1}>
                {displayName}
              </div>
            </div>
          );
        },
      },
      {
        key: 'phrases',
        name: formatMessage('Sample Phrases'),
        fieldName: 'phrases',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={luPhraseCell}>
              <div
                aria-label={formatMessage(`Sample Phrases are {phrases}`, { phrases: item.phrases })}
                css={content}
                tabIndex={-1}
              >
                {item.phrases}
              </div>
            </div>
          );
        },
      },
      {
        key: 'definedIn',
        name: formatMessage('Defined in:'),
        fieldName: 'definedIn',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          const id = item.dialogId;
          return (
            <div
              key={id}
              data-is-focusable
              aria-label={formatMessage(`link to where this luis intent defined`)}
              onClick={() => navigateTo(`/bot/${projectId}/dialogs/${id}`)}
            >
              <Link>{id}</Link>
            </div>
          );
        },
      },
      // {
      //   key: 'beenUsed',
      //   name: formatMessage('Been used'),
      //   fieldName: 'beenUsed',
      //   minWidth: 100,
      //   maxWidth: 100,
      //   isResizable: true,
      //   isCollapsable: true,
      //   data: 'string',
      //   onRender: item => {
      //     return item.used ? (
      //       <FontIcon iconName="Accept" aria-label={formatMessage('Used')} className={iconClass} />
      //     ) : (
      //       <div />
      //     );
      //   },
      // },
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
      {
        key: 'Activity',
        name: formatMessage('Activity'),
        fieldName: 'Activity',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={tableCell}>
              <div aria-label={formatMessage(`State is {state}`, { state: item.state })} css={content} tabIndex={-1}>
                {item.state}
              </div>
            </div>
          );
        },
      },
    ];

    // all view, hide defineIn column
    if (activeDialog) {
      tableColums.splice(2, 1);
    }

    return tableColums;
  };

  function onRenderDetailsHeader(props, defaultRender) {
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
  }

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          componentRef={listRef}
          getKey={(item) => item.Name}
          items={intents}
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
