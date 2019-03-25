/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { useEffect, Fragment, useState, useContext } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { PropTypes } from 'prop-types';

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

export function StorageExplorer(props) {
  const { state, actions } = useContext(Store);
  const { storages, currentStorageFiles, storageExplorerStatus } = state;
  const [currentStorageIndex, setCurrentStorageIndex] = useState(0);
  const [pathNavItems, setPathNavItems] = useState();

  const SUPPORTED_ICON = [
    'accdb',
    'csv',
    'docx',
    'dotx',
    'mpt',
    'odt',
    'one',
    'onepkg',
    'onetoc',
    'pptx',
    'pub',
    'vsdx',
    'xls',
    'xlsx',
    'xsn',
  ];

  // for detail file list in open panel
  const tableColums = [
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
      onRender: item => {
        const iconName = item.iconName;
        if (iconName === 'folder') {
          return <Icon style={{ fontSize: '16px' }} iconName="Folder" />;
        } else if (iconName === 'unknow') {
          return <Icon style={{ fontSize: '16px' }} iconName="Page" />;
        }
        const url = `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${iconName}_16x1.svg`;
        return <img src={url} className={detailListClass.fileIconImg} alt={`${iconName} file icon`} />;
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
      onRender: item => {
        return <span>{item.dateModified}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'File Size',
      fieldName: 'fileSizeRaw',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      data: 'number',
      onRender: item => {
        return <span>{item.fileSize}</span>;
      },
    },
  ];

  const selection = new Selection({
    onSelectionChanged: () => {
      const file = selection.getSelection()[0];
      // todo: fix issue here, some time file is undefine.
      if (file) {
        const type = file.fileType;
        const storageId = storages[currentStorageIndex].id;
        const path = file.filePath;
        if (type === 'folder') {
          updateCurrentPath(storageId, path);
        } else {
          actions.setStorageExplorerStatus('closed');
          props.onFileOpen(storageId, path);
        }
      }
    },
  });

  async function init() {
    const res = await actions.fetchStorages();
    updateCurrentPath(res[currentStorageIndex].id, res[currentStorageIndex].path);
  }

  // fetch storages first then fetch the folder info under it.
  useEffect(() => {
    init();
  }, []);

  function onStorageSourceChange(index) {
    setCurrentStorageIndex(index);
    updateCurrentPath(storages[currentStorageIndex].id, storages[currentStorageIndex].path);
  }

  // todo: result parse from api result to ui acceptable format may need move to reducer.
  const links = [];
  storages.forEach((storage, index) => {
    links.push({
      name: storage.name,
      key: storage.id,
      onClick: () => onStorageSourceChange(index),
    });
  });
  const storageGroup = [
    {
      links: links,
    },
  ];

  function getCurrentPath(array, seperator, start, end) {
    if (!start) start = 0;
    if (!end) end = array.length - 1;
    end++;
    return array.slice(start, end).join(seperator);
  }

  function updateCurrentPath(storageId, path) {
    if (storageId && path) {
      actions.fetchFolderItemsByPath(storageId, path);

      // todo: make sure the separator is the same and working.
      const pathItems = path.split('\\');
      const newPathItems = [];
      for (let i = 0; i < pathItems.length; i++) {
        const item = pathItems[i];
        const currentPath = getCurrentPath(pathItems, '\\', 0, i);
        newPathItems.push({
          text: item,
          key: currentPath,
          onClick: () => {
            updateCurrentPath(storageId, currentPath);
          },
        });
      }
      setPathNavItems(newPathItems);
    }
  }

  const storageFiles = [];
  if (currentStorageFiles.children) {
    currentStorageFiles.children.forEach(file => {
      storageFiles.push({
        name: file.name,
        value: file.name,
        fileType: file.type,
        iconName: getIconName(file),
        dateModified: getFileEditDate(file),
        fileSize: file.size,
        filePath: file.path,
      });
    });
  }

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

  function getFileEditDate(file) {
    if (file.type === 'file') {
      return new Date(file.lastModified).toLocaleDateString();
    }

    return undefined;
  }

  // todo: icon file is fixed for now, need to be updated when get it from designer.
  function getIconName(file) {
    const path = file.path;
    let docType = file.type;
    if (docType === 'folder') {
      return docType;
    } else {
      docType = path.substring(path.lastIndexOf('.') + 1, path.length);
      if (SUPPORTED_ICON.includes(docType)) {
        return docType;
      }

      return 'unknow';
    }
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
                links: [{ name: 'Open', key: 'open' }],
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
              groups={storageGroup}
              initialSelectedKey={storages[currentStorageIndex] ? storages[currentStorageIndex].id : 'default'}
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
        <Breadcrumb items={pathNavItems} ariaLabel={'File path'} maxDisplayedItems={'1'} />
        <DetailsList
          items={storageFiles}
          compact={false}
          columns={tableColums}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          selection={selection}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
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

StorageExplorer.propTypes = {
  onFileOpen: PropTypes.func,
};
