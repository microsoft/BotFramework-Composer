/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Fragment } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';

import { container, body, navHeader, navBody, panelNav, panelContent, iconContainer, icon, classNames } from './styles';

// todo: this is a temp columns need to delete when api is ready
function getColumns() {
  return [
    {
      key: 'column1',
      name: 'File Type',
      className: classNames.fileIconCell,
      iconClassName: classNames.fileIconHeaderIcon,
      ariaLabel: 'Column operations for File type, Press to sort on File type',
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth: 16,
      maxWidth: 16,
      // eslint-disable-next-line react/display-name
      onRender: item => {
        return <img src={item.iconName} className={classNames.fileIconImg} alt={item.fileType + ' file icon'} />;
      },
    },
    {
      key: 'column2',
      name: 'Name',
      fieldName: 'name',
      minWidth: 110,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Date Modified',
      fieldName: 'dateModifiedValue',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'number',
      // eslint-disable-next-line react/display-name
      onRender: item => {
        return <span>{item.dateModified}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'Modified By',
      fieldName: 'modifiedBy',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      data: 'string',
      // eslint-disable-next-line react/display-name
      onRender: item => {
        return <span>{item.modifiedBy}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column5',
      name: 'File Size',
      fieldName: 'fileSizeRaw',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      data: 'number',
      // eslint-disable-next-line react/display-name
      onRender: item => {
        return <span>{item.fileSize}</span>;
      },
    },
  ];
}

function togglePanel(props) {
  props.setPanelStatus(!props.panelStatus);
}

function onItemClicked(ev, item) {
  // todo: implement the state change.
  // eslint-disable-next-line no-console
  console.log(`Breadcrumb item with key "${item.key}" has been clicked.`);
}

function onNavClicked(ev, item) {
  // todo: implement the state change.
  // eslint-disable-next-line no-console
  console.log(`Nav link "${item.key}" has been clicked.`);
}

function getCustomDivider() {
  return <span style={{ cursor: 'pointer' }}>/</span>;
}

// function getItems(props) {
//   return props.getItems();
// }

// this empty div tag used to replace the default panel header.
function onRenderNavigationContent() {
  return (
    <Fragment>
      <div style={{ height: '0px' }} />
    </Fragment>
  );
}

export const OpenBot = props => (
  <Fragment>
    <Panel
      isOpen={props.panelStatus}
      onDismiss={() => togglePanel(props)}
      type={PanelType.customNear}
      css={container}
      isModeless={true}
      isBlocking={false}
      hasCloseButton={false}
      onRenderNavigation={onRenderNavigationContent}
    >
      <div css={body}>
        <div css={panelNav}>
          <div css={navHeader} onClick={() => togglePanel(props)}>
            <div css={iconContainer}>
              <Icon iconName="Back" css={icon} text="Close" />
            </div>
          </div>
          <div>
            <Nav
              groups={[
                {
                  links: [
                    { name: 'Info', key: 'Info', onClick: onNavClicked },
                    { name: 'New', key: 'New', onClick: onNavClicked },
                    { name: 'Open', key: 'Open', onClick: onNavClicked },
                  ],
                },
              ]}
              css={navBody}
              styles={{
                link: {
                  displayName: 'testStyle',
                  backgroundColor: '#2b579a',
                  color: 'white',
                  fontSize: '16px',
                },
              }}
            />
          </div>
        </div>
        <div css={panelContent}>
          <div>
            <Breadcrumb
              items={[
                { text: 'Files', key: 'Files', onClick: onItemClicked },
                { text: 'This is folder 1', key: 'f1', onClick: onItemClicked },
                { text: 'This is folder 2', key: 'f2', onClick: onItemClicked },
                { text: 'This is folder 3', key: 'f3', onClick: onItemClicked },
                { text: 'This is folder 4', key: 'f4', onClick: onItemClicked },
                { text: 'This is folder 5', key: 'f5', onClick: onItemClicked, isCurrentItem: true },
              ]}
              dividerAs={getCustomDivider}
              ariaLabel={'File path'}
            />
          </div>
          <div style={{ height: '100%', minWidth: '300px', overflow: 'auto' }}>
            <DetailsList
              items={() => getColumns()}
              compact={false}
              columns={() => getColumns()}
              setKey="set"
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
              selection={props.selection}
              selectionMode={SelectionMode.none}
              selectionPreservedOnEmptyClick={true}
              onItemInvoked={onItemInvoked}
              enterModalSelectionOnTouch={true}
              on
            />
          </div>
        </div>
      </div>
    </Panel>
  </Fragment>
);

OpenBot.propTypes = {
  panelStatus: PropTypes.boolean,
  setPanelStatus: PropTypes.func,
  selection: PropTypes.instanceOf(Selection),
};
