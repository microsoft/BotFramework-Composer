/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import { useContext, useRef, useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { navigate } from '@reach/router';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { get } from 'lodash';

import { BASEPATH } from '../../constants';
import { StoreContext } from '../../store';

import { formCell, luPhraseCell } from './styles';

export default function TableView(props) {
  const { state, actions } = useContext(StoreContext);
  const { clearBreadcrumb, navTo } = actions;
  const { dialogs, luFiles } = state;
  const activeDialog = props.activeDialog;
  const [intents, setIntents] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    // make up intents data
    const allIntents = luFiles.reduce((result, luFile) => {
      const items = [];
      const luDialog = dialogs.find(dialog => luFile.id === dialog.id);
      get(luFile, 'parsedContent.LUISJsonStructure.utterances', []).forEach(utterance => {
        const name = utterance.intent;
        const updateIntent = items.find(item => item.name === name);
        if (updateIntent) {
          updateIntent.phrases.push(utterance.text);
        } else {
          items.push({
            name,
            phrases: [utterance.text],
            fileId: luFile.id,
            used: luDialog.luIntents.indexOf(name) !== -1, // used by it's dialog or not
          });
        }
      });
      return result.concat(items);
    }, []);

    // all view, show all lu intents
    if (!activeDialog) {
      setIntents(allIntents);
      // dialog view, show dialog intents
    } else {
      const dialogIntents = allIntents.filter(item => {
        return item.fileId === activeDialog.id;
      });

      setIntents(dialogIntents);
    }
  }, [luFiles, activeDialog, dialogs]);

  function navigateToDialog(id) {
    clearBreadcrumb();
    navTo(id);
    navigate(BASEPATH);
  }

  const getTemplatesMoreButtons = (item, index) => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          props.onEdit(intents[index]);
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
            <div key={id} onClick={() => navigateToDialog(id)}>
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
  onChange: PropTypes.func,
  activeDialog: PropTypes.object,
  onEdit: PropTypes.func,
};
