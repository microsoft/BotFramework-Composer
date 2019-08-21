/* eslint-disable react/display-name */
import React, { useContext, useRef, useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import { isEmpty, get } from 'lodash';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { OpenConfirmModal, DialogStyle } from '../../components/Modal';
import { StoreContext } from '../../store';
import * as luUtil from '../../utils/luUtil';
import { BotStatus } from '../../constants';

import { formCell, luPhraseCell } from './styles';

export default function TableView(props) {
  const { state, actions } = useContext(StoreContext);
  const { navTo } = actions;
  const { dialogs, luFiles, botStatus } = state;
  const { activeDialog, onClickEdit } = props;
  const [intents, setIntents] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (isEmpty(luFiles)) return;

    const errorFiles = checkErrors(luFiles);
    if (errorFiles.length !== 0) {
      showErrors(errorFiles);
      return;
    }

    const allIntents = luFiles.reduce((result, luFile) => {
      const items = [];
      const luDialog = dialogs.find(dialog => luFile.id === dialog.id);
      get(luFile, 'parsedContent.LUISJsonStructure.utterances', []).forEach(utterance => {
        const name = utterance.intent;
        const updateIntent = items.find(item => item.name === name && item.fileId === luFile.id);
        const state = getIntentState(luFile);
        if (updateIntent) {
          updateIntent.phrases.push(utterance.text);
        } else {
          items.push({
            name,
            phrases: [utterance.text],
            fileId: luFile.id,
            used: luDialog.luIntents.indexOf(name) !== -1, // used by it's dialog or not
            state,
          });
        }
      });
      return result.concat(items);
    }, []);

    if (!activeDialog) {
      setIntents(allIntents);
    } else {
      const dialogIntents = allIntents.filter(t => t.fileId === activeDialog.id);
      setIntents(dialogIntents);
    }
  }, [luFiles, activeDialog, botStatus]);

  function checkErrors(files) {
    return files.filter(file => {
      return luUtil.isValid(file.diagnostics) === false;
    });
  }

  function getIntentState(file) {
    if (!file.diagnostics) {
      return 'Error';
    } else if (file.publishing) {
      return 'Publishing';
    } else if (file.status && file.status.lastUpdateTime >= file.status.lastPublishTime) {
      return 'Not yet published';
    } else if (
      file.status &&
      file.status.lastPublishTime > file.status.lastUpdateTime &&
      botStatus === BotStatus.connected
    ) {
      return 'Published & Connected';
    } else if (
      file.status &&
      file.status.lastPublishTime > file.status.lastUpdateTime &&
      botStatus !== BotStatus.connected
    ) {
      return 'Published';
    } else {
      return 'Unknown State'; // It's a bug in most cases.
    }
  }

  async function showErrors(files) {
    for (const file of files) {
      const errorMsg = luUtil.combineMessage(file.diagnostics);
      const errorTitle = formatMessage('There was a problem parsing {fileId}.lu file.', { fileId: file.id });
      const confirmed = await OpenConfirmModal(errorTitle, errorMsg, {
        style: DialogStyle.Console,
        confirmBtnText: formatMessage('Edit'),
      });
      if (confirmed === true) {
        onClickEdit({ fileId: file.id });
        break;
      }
    }
  }

  const getTemplatesMoreButtons = (item, index) => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          onClickEdit(intents[index]);
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
        onRender: item => {
          return <div css={formCell}>#{item.name}</div>;
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
          const phraseLines = item.phrases.map((text, idx) => {
            return <p key={idx}>{text}</p>;
          });
          return <div css={luPhraseCell}>{phraseLines}</div>;
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
            <div key={id} onClick={() => navTo(id)}>
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
        key: 'State',
        name: formatMessage('State'),
        fieldName: 'State',
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
}

TableView.propTypes = {
  activeDialog: PropTypes.object,
  onClickEdit: PropTypes.func,
};
