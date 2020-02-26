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
import { isValid, LuFile } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import { navigateTo } from '../../utils';

import { formCell, luPhraseCell } from './styles';
interface TableViewProps extends RouteComponentProps<{}> {
  fileId: string;
}

interface Intent {
  name: string;
  phrases: string;
  fileId: string;
  used: boolean;
  state: string;
}

const TableView: React.FC<TableViewProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles } = state;
  const { fileId } = props;
  const activeDialog = dialogs.find(({ id }) => id === fileId);

  const [intents, setIntents] = useState<Intent[]>([]);
  const listRef = useRef(null);

  function checkErrors(files: LuFile[]): LuFile[] {
    return files.filter(file => !isValid(file.diagnostics));
  }

  function getIntentState(file: LuFile): string {
    if (!file.diagnostics) {
      return formatMessage('Error');
    } else if (file.status && file.status.lastUpdateTime >= file.status.lastPublishTime) {
      return formatMessage('Not yet published');
    } else if (file.status && file.status.lastPublishTime > file.status.lastUpdateTime) {
      return formatMessage('Published');
    } else {
      return formatMessage('Unknown State'); // It's a bug in most cases.
    }
  }

  useEffect(() => {
    if (isEmpty(luFiles)) return;

    const errorFiles = checkErrors(luFiles);
    if (errorFiles.length !== 0) {
      navigateTo(`/language-understanding/${errorFiles[0].id}/edit`);
      return;
    }

    const allIntents = luFiles.reduce((result: Intent[], luFile: LuFile) => {
      const items: Intent[] = [];
      const luDialog = dialogs.find(dialog => luFile.id === dialog.id);
      get(luFile, 'intents', []).forEach(({ Name: name, Body: phrases }) => {
        const state = getIntentState(luFile);

        items.push({
          name,
          phrases,
          fileId: luFile.id,
          used: luDialog ? luDialog.luIntents.includes(name) : false, // used by it's dialog or not
          state,
        });
      });
      return result.concat(items);
    }, []);

    if (!activeDialog) {
      setIntents(allIntents);
    } else {
      const dialogIntents = allIntents.filter(t => t.fileId === activeDialog.id);
      setIntents(dialogIntents);
    }
  }, [luFiles, activeDialog]);

  const getTemplatesMoreButtons = (item, index): IContextualMenuItem[] => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          const { name, fileId } = intents[index];
          navigateTo(`/language-understanding/${fileId}/edit?t=${encodeURIComponent(name)}`);
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
          return <div css={formCell}>{displayName}</div>;
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
          return <div css={luPhraseCell}>{item.phrases}</div>;
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
          const id = item.fileId;
          return (
            <div key={id} onClick={() => navigateTo(`/dialogs/${id}`)}>
              <Link>{id}</Link>
            </div>
          );
        },
      },
      {
        key: 'beenUsed',
        name: formatMessage('Been used'),
        fieldName: 'beenUsed',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: item => {
          return item.used ? <IconButton iconProps={{ iconName: 'Accept' }} /> : <div />;
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
          return item.state;
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
