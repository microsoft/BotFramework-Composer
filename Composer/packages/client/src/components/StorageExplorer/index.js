/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Fragment, useState, useRef, useLayoutEffect } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';

import { storageApi } from '../../utils/storage';

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

const storageClient = new storageApi();

export function StorageExplorer(props) {
  function togglePanel(props) {
    props.setPanelStatus(!props.panelStatus);
  }

  const selection = new Selection({
    onSelectionChanged: () => {
      onItemInvoked(selection.getSelection()[0]);
    },
  });

  function onItemInvoked(item) {
    alert(`Item invoked: ${item.name}`);
  }

  function onPathSelected(event, item) {
    // todo: implement the state change.
    // eslint-disable-next-line no-console
    console.log(`Breadcrumb item with key "${item.key}" has been clicked.`);
  }

  function getCurrentPath() {
    return [
      { text: 'Files', key: 'Files', onClick: onPathSelected },
      { text: 'This is folder 1', key: 'f1', onClick: onPathSelected },
      { text: 'This is folder 2', key: 'f2', onClick: onPathSelected },
      { text: 'This is folder 3', key: 'f3', onClick: onPathSelected, isCurrentItem: true },
    ];
  }

  function getStorageSource() {
    let scourceLinks = [];
    storageClient.getStorage((storages, index) => {
      scourceLinks = storages.forEach(storage => {
        return { name: storage.name, key: index, onClick: onNavClicked };
      });
    });
    return [
      {
        links: scourceLinks,
      },
    ];
  }

  // this empty div tag used to replace the default panel header.
  function onRenderNavigationContent() {
    return (
      <Fragment>
        <div style={{ height: '0px' }} />
      </Fragment>
    );
  }

  // for detail file list in open panel
  // cloumns title
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
  const LOREM_IPSUM = (
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut ' +
    'labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut ' +
    'aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
    'eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt '
  ).split(' ');
  let loremIndex = 0;
  const folderItems = getFolderItems();

  const [fileInfos, setFileInfos] = useState(folderItems[0].value);
  const fileItemsRef = useRef();

  useLayoutEffect(() => {
    fileItemsRef.current = fileInfos;
  }, [fileInfos]);

  function onNavClicked(event, item) {
    setFileInfos(folderItems[item.key].value);
  }

  function lorem(wordCount) {
    const startIndex = loremIndex + wordCount > LOREM_IPSUM.length ? 0 : loremIndex;
    loremIndex = startIndex + wordCount;
    return LOREM_IPSUM.slice(startIndex, loremIndex).join(' ');
  }

  function getFolderItems() {
    const items1 = [];
    const items2 = [];
    for (let i = 0; i < 10; i++) {
      const randomDate = getFileEditDate(new Date(2012, 0, 1), new Date());
      const randomFileSize = getFileSize();
      const randomFileType = getFileIcon();
      let fileName = lorem(2);
      fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1).concat(`.${randomFileType.docType}`);
      let userName = lorem(2);
      userName = userName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase() + name.slice(1))
        .join(' ');
      items1.push({
        name: fileName,
        value: fileName,
        iconName: randomFileType.url,
        fileType: randomFileType.docType,
        modifiedBy: userName,
        dateModified: randomDate.dateFormatted,
        dateModifiedValue: randomDate.value,
        fileSize: randomFileSize.value,
        fileSizeRaw: randomFileSize.rawSize,
      });
      for (let i = 11; i < 100; i++) {
        const randomDate = getFileEditDate(new Date(2012, 0, 1), new Date());
        const randomFileSize = getFileSize();
        const randomFileType = getFileIcon();
        let fileName = lorem(2);
        fileName = `${fileName}.${randomFileType.docType}`;
        let userName = lorem(2);
        userName = userName
          .split(' ')
          .map(name => name.charAt(0).toUpperCase() + name.slice(1))
          .join(' ');
        items2.push({
          name: fileName,
          value: fileName,
          iconName: randomFileType.url,
          fileType: randomFileType.docType,
          modifiedBy: userName,
          dateModified: randomDate.dateFormatted,
          dateModifiedValue: randomDate.value,
          fileSize: randomFileSize.value,
          fileSizeRaw: randomFileSize.rawSize,
        });
      }
    }

    return [{ name: 'recent', value: items1 }, { name: 'local', value: items2 }];
  }

  function getFileEditDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return {
      value: date.valueOf(),
      dateFormatted: date.toLocaleDateString(),
    };
  }

  function getFileIcon() {
    const docType = FILE_ICONS[Math.floor(Math.random() * FILE_ICONS.length)].name;
    return {
      docType,
      url: `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${docType}_16x1.svg`,
    };
  }

  function getFileSize() {
    const fileSize = Math.floor(Math.random() * 100) + 30;
    return {
      value: `${fileSize} KB`,
      rawSize: fileSize,
    };
  }

  function onColumnClick(event, column) {
    const items = fileItemsRef.current;
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

  function getLeftNav() {
    return (
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
                links: [{ name: 'Open', key: 'open', onClick: onPathSelected }],
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
              groups={getStorageSource()}
              initialSelectedKey={'0'}
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
        <Breadcrumb items={getCurrentPath()} ariaLabel={'File path'} maxDisplayedItems={'1'} />
        <DetailsList
          items={fileInfos}
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
        isOpen={props.panelStatus}
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

StorageExplorer.propTypes = {
  panelStatus: PropTypes.bool,
  setPanelStatus: PropTypes.func,
  items: PropTypes.array,
  columns: PropTypes.array,
};
