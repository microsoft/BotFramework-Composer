import React, { Fragment, useState, useLayoutEffect, useRef } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import Routes from './router';
import { Store } from './store/index';
import { OpenBot } from './components/OpenBot';

initializeIcons(/* optional base url */);

export function App() {
  const { state, actions } = useContext(Store);
  const { botStatus } = state;

  function handleFileOpen(files) {
    if (files.length > 0) {
      const file = files[0];
      actions.fetchFilesByOpen(file.name);
    }
  }

  // todo: should be remove
  // for detail file list in open panel
  // cloumns title
  const classNames = mergeStyleSets({
    fileIconHeaderIcon: {
      padding: 0,
      fontSize: '16px',
    },
    fileIconCell: {
      textAlign: 'center',
      selectors: {
        '&:before': {
          content: '.',
          display: 'inline-block',
          verticalAlign: 'middle',
          height: '100%',
          width: '0px',
          visibility: 'hidden',
        },
      },
    },
    fileIconImg: {
      verticalAlign: 'middle',
      maxHeight: '16px',
      maxWidth: '16px',
    },
    controlWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    exampleToggle: {
      display: 'inline-block',
      marginBottom: '10px',
      marginRight: '30px',
    },
    selectionDetails: {
      marginBottom: '20px',
    },
  });

  const [columns, setColumns] = useState(_generateColumns());
  function _generateColumns() {
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
        onColumnClick: _onColumnClick,
        // eslint-disable-next-line react/display-name
        onRender: item => {
          return <img src={item.iconName} className={classNames.fileIconImg} alt={item.fileType + ' file icon'} />;
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
        onColumnClick: _onColumnClick,
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
        onColumnClick: _onColumnClick,
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
        onColumnClick: _onColumnClick,
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
        onColumnClick: _onColumnClick,
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
  const allData = _getFileInfoList();

  const [fileItems, setFileItems] = useState(allData[0].value);
  const fileItemsRef = useRef();

  useLayoutEffect(() => {
    fileItemsRef.current = fileItems;
  }, [fileItems]);

  function _lorem(wordCount) {
    const startIndex = loremIndex + wordCount > LOREM_IPSUM.length ? 0 : loremIndex;
    loremIndex = startIndex + wordCount;
    return LOREM_IPSUM.slice(startIndex, loremIndex).join(' ');
  }

  function _getFileInfoList() {
    const items1 = [];
    const items2 = [];
    for (let i = 0; i < 10; i++) {
      const randomDate = _randomDate(new Date(2012, 0, 1), new Date());
      const randomFileSize = _getFileSize();
      const randomFileType = _getFileIcon();
      let fileName = _lorem(2);
      fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1).concat(`.${randomFileType.docType}`);
      let userName = _lorem(2);
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
        const randomDate = _randomDate(new Date(2012, 0, 1), new Date());
        const randomFileSize = _getFileSize();
        const randomFileType = _getFileIcon();
        let fileName = _lorem(2);
        fileName = `${fileName}.${randomFileType.docType}`;
        let userName = _lorem(2);
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

  function _randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return {
      value: date.valueOf(),
      dateFormatted: date.toLocaleDateString(),
    };
  }

  function _getFileIcon() {
    const docType = FILE_ICONS[Math.floor(Math.random() * FILE_ICONS.length)].name;
    return {
      docType,
      url: `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${docType}_16x1.svg`,
    };
  }

  function _getFileSize() {
    const fileSize = Math.floor(Math.random() * 100) + 30;
    return {
      value: `${fileSize} KB`,
      rawSize: fileSize,
    };
  }

  function _onColumnClick(ev, column) {
    const items = fileItemsRef.current;
    const newColumns = columns.slice();
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
    const newItems = _copyAndSort(items, currColumn.fieldName, currColumn.isSortedDescending);
    setColumns(newColumns);
    setFileItems(newItems);
  }

  function _copyAndSort(items, columnKey, isSortedDescending) {
    const key = columnKey;
    return items.slice(0).sort((a, b) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        setBotStatus={status => {
          actions.toggleBot(status);
        }}
        onFileOpen={handleFileOpen}
      />
      <OpenBot
        panelStatus={panelStatus}
        setPanelStatus={setPanelStatus}
        items={fileItems}
        columns={columns}
        setSourceIndex={key => {
          setFileItems(allData[key].value);
        }}
      />
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 50px)' }}>
        <div
          style={{
            width: '80px',
            backgroundColor: '#eaeaea',
            height: 'calc(99vh - 50px)',
            float: 'left',
          }}
        >
          <NavItem to="/" iconName="SplitObject" label="Design" />
          <NavItem to="/content" iconName="CollapseMenu" label="Content" />
          <NavItem to="/setting" iconName="Settings" label="Settings" />
        </div>
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            marginLeft: '80px',
            zIndex: 2,
          }}
        >
          <Routes />
        </div>
      </div>
    </Fragment>
  );
}
