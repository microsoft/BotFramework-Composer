/* eslint-disable react/display-name */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { useEffect, Fragment, useState, useContext } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { FileTypes } from '../../constants/index';
import { Store } from '../../store/index';

import { FileSelector } from './FileSelector/index';
import { ActionSelector } from './ActionSelector/index';
import { StorageSelector } from './StorageSelector/index';
import { container, body, panelContent } from './styles';

export function StorageExplorer(props) {
  const { state, actions } = useContext(Store);
  const { storages, storageExplorerStatus } = state;
  const [currentStorageIndex, setCurrentStorageIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState('');

  const currentStorageId = storages[currentStorageIndex] ? storages[currentStorageIndex].id : 'default';

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
          openFile(path, storageId);
        }
      }
    },
  });

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

  const actionNavItems = [
    {
      links: [
        { name: formatMessage('New'), key: 'new' },
        { name: formatMessage('Open'), key: 'open' },
        { name: formatMessage('Save As'), key: 'saveas' },
      ],
    },
  ];

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

  const separator = '/';
  function updateCurrentPath(newPath, storageId) {
    if (!storageId) {
      storageId = currentStorageId;
    }

    if (newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, separator));
      actions.fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  }

  function openFile(newPath, storageId) {
    actions.setStorageExplorerStatus('closed');
    props.onFileOpen(storageId, newPath);
  }

  // this empty div tag is used to replace the default panel header.
  function onRenderNavigationContent() {
    return (
      <Fragment>
        <div style={{ height: '0px' }} />
      </Fragment>
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
          <ActionSelector groups={actionNavItems} />
          <div css={panelContent}>
            <StorageSelector
              storageNavItems={storageNavItems}
              currentStorageId={currentStorageId}
              actionName={formatMessage('Open')}
            />
            <div style={{ paddingTop: '90px' }}>
              <FileSelector currentPath={currentPath} updateCurrentPath={updateCurrentPath} selection={selection} />
            </div>
          </div>
        </div>
      </Panel>
    </Fragment>
  );
}

StorageExplorer.propTypes = {
  onFileOpen: PropTypes.func,
};
