/* eslint-disable react/display-name */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { useEffect, Fragment, useState, useContext } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';

import { FileTypes, SupportedFileTypes } from '../../constants/index';
import { Store } from '../../store/index';

import {
  container,
  body,
  navHeader,
  leftNav,
  panelContent,
  closeIcon,
  backIcon,
  navLinkClass,
  detailListContainer,
  title,
  detailListClass,
  fileSelectorContainer,
  fileSelectorHeader,
} from './styles';

export function StorageExplorer(props) {
  const { state, actions } = useContext(Store);
  const { storages, focusedStorageFolder, storageExplorerStatus } = state;
  const [currentStorageIndex, setCurrentStorageIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState('');

  const currentStorageId = storages[currentStorageIndex] ? storages[currentStorageIndex].id : 'default';
  // for detail file list in open panel
  const tableColums = [
    {
      key: 'column1',
      name: formatMessage('File Type'),
      className: detailListClass.fileIconCell,
      iconClassName: detailListClass.fileIconHeaderIcon,
      ariaLabel: formatMessage('Column operations for File type, Press to sort on File type'),
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth: 16,
      maxWidth: 16,
      onRender: item => {
        const iconName = item.iconName;
        if (iconName === FileTypes.FOLDER) {
          return <Icon style={{ fontSize: '16px' }} iconName="Folder" />;
        } else if (iconName === FileTypes.UNKNOW) {
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
      name: formatMessage('Date Modified'),
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
      name: formatMessage('File Size'),
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
      // selected item will be cleaned when folder path changed
      // file will be undefine when no item selected.
      if (file) {
        const type = file.fileType;
        const storageId = storages[currentStorageIndex].id;
        const path = file.filePath;
        if (type === FileTypes.FOLDER) {
          updateCurrentPath(path, storageId);
        } else {
          actions.setStorageExplorerStatus('closed');
          props.onFileOpen(storageId, path);
        }
      }
    },
  });

  const storageFiles = focusedStorageFolder.children
    ? focusedStorageFolder.children.map(file => {
        return {
          name: file.name,
          value: file.name,
          fileType: file.type,
          iconName: getIconName(file),
          dateModified: getFileEditDate(file),
          fileSize: file.size ? formatBytes(file.size) : '',
          filePath: file.path,
        };
      })
    : [];

  // todo: result parse from api result to ui acceptable format may need move to reducer.
  const links = storages.map((storage, index) => {
    return {
      name: storage.name,
      key: storage.id,
      onClick: () => onStorageSourceChange(index),
    };
  });
  const storageNavItems = [
    {
      links: links,
    },
  ];

  const separator = '/';
  // filter the empty one, server api need '/' for root path, but no need for others.
  const pathItems = path
    .normalize(currentPath)
    .split(separator)
    .filter(p => p !== '');
  const breadcrumbItems = pathItems.map((item, index) => {
    const itemPath = getNavItemPath(pathItems, separator, 0, index);
    return {
      text: item,
      key: itemPath,
      onClick: () => {
        updateCurrentPath(itemPath, currentStorageId);
      },
    };
  });

  async function init() {
    const res = await actions.fetchStorages();
    updateCurrentPath(res[currentStorageIndex].path, res[currentStorageIndex].id);
  }

  // fetch storages first then fetch the folder info under it.
  useEffect(() => {
    init();
  }, []);

  function onStorageSourceChange(index) {
    setCurrentStorageIndex(index);
    updateCurrentPath(storages[index].path, storages[index].id);
  }

  function getNavItemPath(array, seperator, start, end) {
    if (end === 0) return array[0] + seperator;
    if (!start) start = 0;
    if (!end) end = array.length - 1;
    end++;
    return array.slice(start, end).join(seperator);
  }

  function updateCurrentPath(newPath, storageId) {
    if (storageId && newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, separator));
      actions.fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  }

  function formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024,
      dm = decimals <= 0 ? 0 : decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function toggleExplorer() {
    status === 'closed' ? 'opened' : 'closed';
    actions.setStorageExplorerStatus(status);
  }

  // this empty div tag is used to replace the default panel header.
  function onRenderNavigationContent() {
    return (
      <Fragment>
        <div style={{ height: '0px' }} />
      </Fragment>
    );
  }

  function getFileEditDate(file) {
    if (file && file.lastModified) {
      return new Date(file.lastModified).toLocaleDateString();
    }

    return '';
  }

  // todo: icon file is fixed for now, need to be updated when get it from designer.
  function getIconName(file) {
    const path = file.path;
    let docType = file.type;
    if (docType === FileTypes.FOLDER) {
      return docType;
    } else {
      docType = path.substring(path.lastIndexOf('.') + 1, path.length);
      if (SupportedFileTypes.includes(docType)) {
        return docType;
      }

      return FileTypes.UNKNOW;
    }
  }

  function onBackIconClicked() {
    const path = focusedStorageFolder.parent;
    updateCurrentPath(path, currentStorageId);
  }

  function getLeftNav() {
    return (
      <div css={leftNav}>
        <div css={navHeader} onClick={() => toggleExplorer()}>
          <Icon iconName="Back" css={closeIcon} text={formatMessage('Close')} />
        </div>
        <div>
          <Nav
            groups={[
              {
                links: [{ name: formatMessage('Open'), key: 'open' }],
              },
            ]}
            initialSelectedKey={'open'}
            styles={{
              link: navLinkClass.actionNav,
              linkText: navLinkClass.linkText,
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
              groups={storageNavItems}
              initialSelectedKey={currentStorageId}
              styles={{
                link: navLinkClass.storageNav,
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }

  function getFileSelector() {
    return (
      <div css={fileSelectorContainer}>
        <div css={fileSelectorHeader}>
          <Icon iconName="Back" css={backIcon} text={formatMessage('Back')} onClick={onBackIconClicked} />
          <div style={{ flexGrow: 1 }}>
            <Breadcrumb items={breadcrumbItems} ariaLabel={formatMessage('File path')} maxDisplayedItems={1} />
          </div>
        </div>
        <DetailsList
          css={detailListContainer}
          items={storageFiles}
          compact={false}
          columns={tableColums}
          getKey={item => item.name}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          selection={selection}
          selectionMode={SelectionMode.single}
          checkboxVisibility={CheckboxVisibility.hidden}
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
