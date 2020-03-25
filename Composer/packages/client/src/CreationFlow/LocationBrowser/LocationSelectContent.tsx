// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment, useContext, useRef } from 'react';

import { CreationFlowStatus } from '../../constants';
import { StorageFolder } from '../../store/types';

import { FileSelector } from './FileSelector';
import { StoreContext } from './../../store';
import { FileTypes } from './../../constants';
interface LocationSelectContentProps {
  onOpen?: (path: string, storage: string) => void;
  focusedStorageFolder: StorageFolder;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
}

export const LocationSelectContent: React.FC<LocationSelectContentProps> = props => {
  const { onOpen, focusedStorageFolder, onCurrentPathUpdate } = props;
  const { state } = useContext(StoreContext);
  const { storages, storageFileLoadingStatus, creationFlowStatus } = state;
  const currentStorageIndex = useRef(0);
  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        onCurrentPathUpdate(path, storageId);
      } else if (type === FileTypes.BOT && creationFlowStatus === CreationFlowStatus.OPEN) {
        onOpen && onOpen(path, storageId);
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
        focusedStorageFolder={focusedStorageFolder}
        onCurrentPathUpdate={onCurrentPathUpdate}
        onSelectionChanged={onSelectionChanged}
        platform={storages[currentStorageIndex.current].platform}
      />
    </Fragment>
  );
};
