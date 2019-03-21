/* eslint-disable no-unused-vars */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { useEffect, Fragment, useState, useRef, useLayoutEffect, useContext } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';

import { Store } from '../../store/index';

import {
  container,
  body,
  navHeader,
  navBody,
  panelNav,
  panelContent,
  iconContainer,
  icon,
  navLinks,
  detailListContainer,
  title,
  detailListClass,
} from './styles';

export function StorageExplorer() {
  const storagesRef = useRef();
  const storageFilesRef = useRef();
  const currentPathRef = useRef();
  const { state, actions } = useContext(Store);
  const { storages, currentStorage, currentStorageFiles, storageExplorerStatus } = state;
  const FILE_ICONS = [
    { name: 'accdb' },
    { name: 'csv' },
    { name: 'docx' },
    { name: 'dotx' },
    { name: 'mpt' },
    { name: 'odt' },
    { name: 'one' },
    { name: 'onepkg' },
    { name: 'onetoc' },
    { name: 'pptx' },
    { name: 'pub' },
    { name: 'vsdx' },
    { name: 'xls' },
    { name: 'xlsx' },
    { name: 'xsn' },
  ];

  // for detail file list in open panel
  const [tableColums, setTableColumns] = useState(generateTableColumns());
  function generateTableColumns() {
    return [
      {
        key: 'column1',
        name: 'File Type',
        className: detailListClass.fileIconCell,
        iconClassName: detailListClass.fileIconHeaderIcon,
        ariaLabel: 'Column operations for File type, Press to sort on File type',
        iconName: 'Page',
        isIconOnly: true,
        fieldName: 'name',
        minWidth: 16,
        maxWidth: 16,
        onColumnClick: onColumnClick,
        // eslint-disable-next-line react/display-name
        onRender: item => {
          return <img src={item.iconName} className={detailListClass.fileIconImg} alt={item.fileType + ' file icon'} />;
        },
      },
      {
        key: 'column2',
        name: 'Name',
        fieldName: 'name',
        minWidth: 150,
        maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        onColumnClick: onColumnClick,
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
        onColumnClick: onColumnClick,
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
        onColumnClick: onColumnClick,
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
        onColumnClick: onColumnClick,
        // eslint-disable-next-line react/display-name
        onRender: item => {
          return <span>{item.fileSize}</span>;
        },
      },
    ];
  }

  const selection = new Selection({
    onSelectionChanged: () => {
      onItemInvoked(selection.getSelection()[0]);
    },
  });

  useEffect(() => {
    actions.fetchStorages();
  }, []);

  // todo: result pass from api result to ui acceptable format may need move to reducer.
  useLayoutEffect(() => {
    const links = [];
    storages.forEach(storage => {
      links.push({
        name: storage.name,
        key: storage.id,
        onClick: onNavClicked,
      });
    });
    storagesRef.current = [
      {
        links: links,
      },
    ];
  }, [storages]);

  useLayoutEffect(() => {
    if (currentStorage.path) {
      const pathItems = currentStorage.path.split('/');
      let folderPath = '';
      pathItems.forEach(item => {
        folderPath += `${item}/`;
        return { text: item, key: folderPath, onClick: onPathChange };
      });
      currentPathRef.current = pathItems;
    }
  }, [currentStorage]);

  useLayoutEffect(() => {
    storageFilesRef.current = currentStorageFiles;
  }, [currentStorageFiles]);

  function toggleExplorer() {
    status === 'closed' ? 'opened' : 'closed';
    actions.setStorageExplorerStatus(status);
  }

  // this empty div tag used to replace the default panel header.
  function onRenderNavigationContent() {
    return (
      <Fragment>
        <div style={{ height: '0px' }} />
      </Fragment>
    );
  }

  function onNavClicked(event, item) {
    const selectedStorage = storages.find(storage => storage.id === item.key);
    actions.fetchFolderItemsByPath(selectedStorage);
  }

  // function getFileEditDate(start, end) {
  //   const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  //   return {
  //     value: date.valueOf(),
  //     dateFormatted: date.toLocaleDateString(),
  //   };
  // }

  // function getFileIcon() {
  //   const docType = FILE_ICONS[Math.floor(Math.random() * FILE_ICONS.length)].name;
  //   return {
  //     docType,
  //     url: `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${docType}_16x1.svg`,
  //   };
  // }

  // function getFileSize() {
  //   const fileSize = Math.floor(Math.random() * 100) + 30;
  //   return {
  //     value: `${fileSize} KB`,
  //     rawSize: fileSize,
  //   };
  // }

  function onColumnClick(event, column) {
    const items = storageFilesRef.current;
    const newColumns = tableColums.slice();
    const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach(newCol => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newItems = copyAndSort(items, currColumn.fieldName, currColumn.isSortedDescending);
    setTableColumns(newColumns);
    setFileInfos(newItems);
  }

  function copyAndSort(items, columnKey, isSortedDescending) {
    const key = columnKey;
    return items.slice(0).sort((a, b) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }

  function onItemInvoked(item) {
    alert(`Item invoked: ${item.name}`);
  }

  function onPathChange(event, item) {
    // todo: implement the state change.
    alert(`"${item.key}" has been clicked.`);
  }

  function getLeftNav() {
    return (
      <div css={panelNav}>
        <div css={navHeader} onClick={() => toggleExplorer()}>
          <div css={iconContainer}>
            <Icon iconName="Back" css={icon} text="Close" />
          </div>
        </div>
        <div>
          <Nav
            groups={[
              {
                links: [{ name: 'Open', key: 'open', onClick: onPathChange }],
              },
            ]}
            initialSelectedKey={'open'}
            css={navBody}
            styles={{
              link: navLinks.actionNavLink,
              linkText: navLinks.linkText,
            }}
          />
        </div>
      </div>
    );
  }

  function getSourceSelector() {
    return (
      <Fragment>
        <div>
          <div css={title}>Open</div>
          <div style={{ paddingTop: '10px' }}>
            <Nav
              groups={storagesRef.current}
              initialSelectedKey={currentStorage.id}
              css={navBody}
              styles={{
                link: navLinks.sourceNavLink,
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }

  function getFileSelector() {
    return (
      <div style={{ width: '100%', paddingLeft: '5px', paddingTop: '90px' }}>
        <Breadcrumb items={currentPathRef.current} ariaLabel={'File path'} maxDisplayedItems={'1'} />
        <DetailsList
          items={currentStorageFiles}
          compact={false}
          columns={tableColums}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          selection={selection}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          onItemInvoked={onItemInvoked}
          enterModalSelectionOnTouch={true}
          css={detailListContainer}
        />
      </div>
    );
  }

  return (
    <Fragment>
      <Panel
        isOpen={storageExplorerStatus === 'opened'}
        type={PanelType.customNear}
        css={container}
        isModeless={true}
        isBlocking={false}
        hasCloseButton={false}
        onRenderNavigation={onRenderNavigationContent}
      >
        <div css={body}>
          {getLeftNav()}
          <div css={panelContent}>
            {getSourceSelector()}
            {getFileSelector()}
          </div>
        </div>
      </Panel>
    </Fragment>
  );
}
