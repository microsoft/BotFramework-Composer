/* eslint-disable react/prop-types */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';
import findindex from 'lodash.findindex';

import { FileSelector } from './FileSelector';
import { StorageSelector } from './StorageSelector';
import { SaveAction } from './SaveAction';
import NewStorageModal from './NewStorage/NewStorageModal';
import { Store } from './../../store';
import { OpenStatus, FileTypes } from './../../constants';

export function LocationSelectContent(props) {
  const { state, actions } = useContext(Store);
  const { storages, storageExplorerStatus, focusedStorageFolder, storageFileLoadingStatus } = state;
  const { onSaveAs, onOpen } = props;
  const { fetchFolderItemsByPath, addNewStorage } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  useEffect(() => {
    const index = currentStorageIndex.current;
    updateCurrentPath(storages[index].path, storages[index].id);
  }, [storages]);

  function onStorageSourceChange(index) {
    currentStorageIndex.current = index;
    setOpenAdd(false);
    updateCurrentPath(storages[index].path, storages[index].id);
  }

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }

    if (newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      await fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  };

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else {
        onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = item => {
    if (storageExplorerStatus === OpenStatus.SAVEAS && item.type !== 'folder') {
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
    let parent = focusedStorageFolder.parent;
    if (parent === '/') {
      parent = '';
    }
    const dir = `${parent}/${focusedStorageFolder.name}`;
    const absolutePath = `${dir}/${value}/bot.botproj`;
    await onSaveAs(storages[currentStorageIndex.current].id, absolutePath);
    updateCurrentPath(dir, storages[currentStorageIndex.current].id);
  };

  const handleAddStorage = async storageData => {
    await addNewStorage(storageData);
    setOpenAdd(false);
  };

  return (
    <Fragment>
      <StorageSelector
        storages={storages}
        onStorageSourceChange={onStorageSourceChange}
        onAddNew={() => {
          setOpenAdd(true);
        }}
        currentStorageId={currentStorageId}
      />
      <FileSelector
        saveAction={
          storageExplorerStatus === OpenStatus.OPEN ? (
            <div />
          ) : (
            <SaveAction onSave={handleSaveAs} onGetErrorMessage={checkDuplicate} />
          )
        }
        storageExplorerStatus={storageExplorerStatus}
        storageFileLoadingStatus={storageFileLoadingStatus}
        checkShowItem={checkShowItem}
        currentPath={currentPath}
        focusedStorageFolder={focusedStorageFolder}
        updateCurrentPath={updateCurrentPath}
        onSelectionChanged={onSelectionChanged}
      />
      <NewStorageModal
        isOpen={openAdd}
        storages={storages}
        onSubmit={handleAddStorage}
        onDismiss={() => setOpenAdd(false)}
      />
    </Fragment>
  );
}
