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
import { navigateTo } from '../../utils';

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

const TableView: React.FC<TableViewProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, locale, projectId } = state;
  const { dialogId } = props;
  const activeDialog = dialogs.find(({ id }) => id === dialogId);

  const [intents, setIntents] = useState<Intent[]>([]);
  const listRef = useRef(null);

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
      const luDialog = dialogs.find(dialog => luFile.id === `${dialog.id}.${locale}`);
      get(luFile, 'intents', []).forEach(({ Name: name, Body: phrases }) => {
        const state = getIntentState(luFile);

        items.push({
          name,
          phrases,
          fileId: luFile.id,
          dialogId: luDialog?.id || '',
          used: !!luDialog && luDialog.referredLuIntents.some(lu => lu.name === name), // used by it's dialog or not
          state,
        });
      });
      return result.concat(items);
    }, []);

    if (!activeDialog) {
      setIntents(allIntents);
    } else {
      const dialogIntents = allIntents.filter(t => t.dialogId === activeDialog.id);
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
            <div data-is-focusable={true} css={formCell}>
              <div tabIndex={-1} css={content} aria-label={formatMessage(`Name is {name}`, { name: displayName })}>
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
        onRender: item => {
          return (
            <div data-is-focusable={true} css={luPhraseCell}>
              <div
                tabIndex={-1}
                css={content}
                aria-label={formatMessage(`Sample Phrases are {phrases}`, { phrases: item.phrases })}
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
        onRender: item => {
          const id = item.dialogId;
          return (
            <div
              data-is-focusable={true}
              key={id}
              onClick={() => navigateTo(`/bot/${projectId}/dialogs/${id}`)}
              aria-label={formatMessage(`link to where this luis intent defined`)}
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
            <IconButton
              menuIconProps={{ iconName: 'MoreVertical' }}
              menuProps={{
                shouldFocusOnMount: true,
                items: getTemplatesMoreButtons(item, index),
              }}
              styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
              ariaLabel={formatMessage('Open inline editor')}
            />
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
        onRender: item => {
          return (
            <div data-is-focusable={true} css={tableCell}>
              <div tabIndex={-1} css={content} aria-label={formatMessage(`State is {state}`, { state: item.state })}>
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
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          componentRef={listRef}
          items={intents}
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
          className="table-view-list"
          columns={getTableColums()}
          getKey={item => item.Name}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={onRenderDetailsHeader}
          selectionMode={SelectionMode.none}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
