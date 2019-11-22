// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';

import storage from '../../utils/storage';

import { FileSelector } from './FileSelector';
import { StoreContext } from './../../store';
import { FileTypes } from './../../constants';

const NEW_BOT_LOCATION_KEY = 'newBotLocation';

export function LocationSelectContent(props) {
  const { state, actions } = useContext(StoreContext);
  const { storages, focusedStorageFolder, storageFileLoadingStatus } = state;
  const { onOpen, onChange, allowOpeningBot = true } = props;

  const { fetchFolderItemsByPath } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState(storage.get(NEW_BOT_LOCATION_KEY, ''));
  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  useEffect(() => {
    if (onChange) {
      onChange(currentPath);
    }
  }, []);

  const updateCurrentPath = async (newPath?: string, storageId?: string) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      // const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      const formatedPath = path.normalize(newPath);
      await fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  };

  useEffect(() => {
    const index = currentStorageIndex.current;
    let path = currentPath;
    let id = '';
    if (storages[index]) {
      path = path || storages[index].path;
      id = storages[index].id;
    }
    updateCurrentPath(path, id);
  }, [storages]);

  useEffect(() => {
    if (onChange) {
      onChange(currentPath);
    }
    storage.set(NEW_BOT_LOCATION_KEY, currentPath);
  }, [currentPath]);

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else if (type === FileTypes.BOT && allowOpeningBot) {
        onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = item => {
    if (item.type === 'bot' || item.type === 'folder') {
      return true;
    }
    return false;
  };

  return (
    <Fragment>
      <FileSelector
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
