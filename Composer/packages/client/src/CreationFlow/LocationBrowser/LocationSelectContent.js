/* eslint-disable react/prop-types */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';

import { FileSelector } from './FileSelector';
// import { SaveAction } from './SaveAction';
import { StoreContext } from './../../store';
// import { OpenStatus, FileTypes } from './../../constants';
import { FileTypes } from './../../constants';

export function LocationSelectContent(props) {
  const { state, actions } = useContext(StoreContext);
  const { storages, storageExplorerStatus, focusedStorageFolder, storageFileLoadingStatus } = state;
  const { onOpen, onChange } = props;

  const { fetchFolderItemsByPath } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState('');
  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  useEffect(() => {
    const index = currentStorageIndex.current;
    updateCurrentPath(storages[index].path, storages[index].id);
  }, [storages]);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }

    if (newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      await fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
      if (onChange) {
        onChange(formatedPath);
      }
    }
  };

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else if (type === FileTypes.BOT) {
        onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = item => {
    // this is a file->open browser
    if (onOpen) {
      if (item.type === 'bot' || item.type === 'folder') {
        return true;
      }
      return false;
    } else {
      return item.type === 'folder';
    }
  };

  return (
    <Fragment>
      <FileSelector
        storageExplorerStatus={storageExplorerStatus}
        storageFileLoadingStatus={storageFileLoadingStatus}
        checkShowItem={checkShowItem}
        currentPath={currentPath}
        focusedStorageFolder={focusedStorageFolder}
        updateCurrentPath={updateCurrentPath}
        onSelectionChanged={onSelectionChanged}
      />
    </Fragment>
  );
}
