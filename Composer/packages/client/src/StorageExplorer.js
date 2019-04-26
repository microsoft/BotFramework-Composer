/* eslint-disable react/display-name */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { useEffect, useState, useContext, useRef } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import formatMessage from 'format-message';
import findindex from 'lodash.findindex';

import { FileTypes } from './constants';
import { Store } from './store';
import { FileSelector } from './components/StorageExplorer/FileSelector';
import { ActionSelector } from './components/StorageExplorer/ActionSelector';
import { StorageSelector } from './components/StorageExplorer/StorageSelector';
import { container, body, panelContent } from './components/StorageExplorer/styles';
import { SaveAction } from './components/StorageExplorer/SaveAction/index';
// this empty div tag is used to replace the default panel header.
function onRenderNavigationContent() {
  return <div style={{ height: '0px' }} />;
}

const links = [{ name: formatMessage('Open'), key: 'open' }, { name: formatMessage('Save As'), key: 'saveas' }];

export function StorageExplorer() {
  const { state, actions } = useContext(Store);
  const { storages, storageExplorerStatus, focusedStorageFolder } = state;
  const {
    setStorageExplorerStatus,
    closeCurrentProject,
    fetchFolderItemsByPath,
    openBotProject,
    saveProjectAs,
  } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState('');

  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  async function init() {
    const res = await actions.fetchStorages();
    updateCurrentPath(res[currentStorageIndex.current].path, res[currentStorageIndex.current].id);
  }

  // fetch storages first then fetch the folder info under it.
  useEffect(() => {
    init();
  }, []);

  function onStorageSourceChange(index) {
    currentStorageIndex.current = index;
    updateCurrentPath(storages[index].path, storages[index].id);
  }

  function updateCurrentPath(newPath, storageId) {
    if (!storageId) {
      storageId = currentStorageId;
    }

    if (newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  }

  function openFile(newPath, storageId) {
    setStorageExplorerStatus('');
    closeCurrentProject();
    openBotProject(storageId, newPath);
  }

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else {
        openFile(path, storageId);
      }
    }
  };

  const onCloseExplorer = () => {
    setStorageExplorerStatus('');
  };

  const onLinkClick = (event, item) => {
    setStorageExplorerStatus(item.key);
  };

  const checkShowItem = item => {
    if (storageExplorerStatus === 'saveas' && item.type !== 'folder') {
      return false;
    }
    return true;
  };

  const checkDuplicate = value => {
    if (focusedStorageFolder.children) {
      const index = findindex(focusedStorageFolder.children, { name: value });
      if (index >= 0) {
        return 'Duplicate folder name';
      }
    }
    return '';
  };

  const handleSaveAs = async value => {
    const dir = `${focusedStorageFolder.parent}/${focusedStorageFolder.name}`;
    const absolutePath = `${dir}/${value}/bot.botproj`;
    await saveProjectAs(storages[currentStorageIndex.current].id, absolutePath);
    updateCurrentPath(dir, storages[currentStorageIndex.current].id);
    onCloseExplorer();
  };

  return (
    <Panel
      isOpen={storageExplorerStatus !== ''}
      type={PanelType.customNear}
      css={container}
      isModeless={true}
      isBlocking={false}
      hasCloseButton={false}
      onRenderNavigation={onRenderNavigationContent}
    >
      <div css={body}>
        <ActionSelector
          links={links}
          selectedKey={storageExplorerStatus}
          onLinkClick={onLinkClick}
          onCloseExplorer={onCloseExplorer}
        />
        <div css={panelContent}>
          <StorageSelector
            storages={storages}
            onStorageSourceChange={onStorageSourceChange}
            currentStorageId={currentStorageId}
            actionName={formatMessage(storageExplorerStatus === 'open' ? 'Open' : 'Save As')}
          />
          <div style={{ paddingTop: '90px' }}>
            <FileSelector
              saveAction={
                storageExplorerStatus === 'open' ? (
                  <div />
                ) : (
                  <SaveAction onSave={handleSaveAs} onGetErrorMessage={checkDuplicate} />
                )
              }
              storageExplorerStatus={storageExplorerStatus}
              checkShowItem={checkShowItem}
              currentPath={currentPath}
              focusedStorageFolder={focusedStorageFolder}
              updateCurrentPath={updateCurrentPath}
              onSelectionChanged={onSelectionChanged}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
