// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';

import { FileSelector } from './FileSelector';
import { StoreContext } from './../../store';
import { FileTypes } from './../../constants';

export function LocationSelectContent(props) {
  const { state } = useContext(StoreContext);
  const { storages, storageFileLoadingStatus } = state;
  const { onOpen, allowOpeningBot = true, focusedStorageFolder, updateCurrentPath, currentPath } = props;

  const currentStorageIndex = useRef(0);

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
