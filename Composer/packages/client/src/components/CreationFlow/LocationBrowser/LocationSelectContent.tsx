// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import formatMessage from 'format-message';
import { jsx } from '@emotion/core';
import { useContext, useRef } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { CreationFlowStatus } from '../../../constants';
import { File } from '../../../store/types';
import { StoreContext } from '../../../store';
import { FileTypes } from '../../../constants';
import { StorageFolder } from '../../../store/types';

import { FileSelector } from './FileSelector';
import { loading, fileSelectorContainer } from './styles';

interface LocationSelectContentProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  createFolder?: (path: string, name: string) => void;
  updateFolder?: (path: string) => void;
  focusedStorageFolder: StorageFolder;
  onOpen?: (path: string, storage: string) => void;
  onCurrentPathUpdate: (newPath: string, storageId?: string) => void;
}

export const LocationSelectContent: React.FC<LocationSelectContentProps> = (props) => {
  const { onOpen, onCurrentPathUpdate, operationMode, focusedStorageFolder, createFolder, updateFolder } = props;
  const { state } = useContext(StoreContext);
  const { storages, storageFileLoadingStatus, creationFlowStatus } = state;
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const isWindows = storage && storage.platform === 'win32';
  const onFileChosen = (item: File) => {
    if (item) {
      const { type, path } = item;
      const storageId = storage.id;
      if (type === FileTypes.FOLDER) {
        onCurrentPathUpdate(path, storageId);
      } else if (type === FileTypes.BOT && creationFlowStatus === CreationFlowStatus.OPEN) {
        onOpen && onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = (item) => {
    if (item.type === 'bot' || item.type === 'folder') {
      return true;
    }
    return false;
  };

  return (
    <div css={fileSelectorContainer}>
      {Object.keys(focusedStorageFolder).length > 0 && storageFileLoadingStatus === 'success' && (
        <FileSelector
          checkShowItem={checkShowItem}
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          isWindows={isWindows}
          operationMode={operationMode}
          storages={storages}
          updateFolder={updateFolder}
          onCurrentPathUpdate={onCurrentPathUpdate}
          onFileChosen={onFileChosen}
        />
      )}
      {storageFileLoadingStatus === 'pending' && (
        <div data-testId={'locationSelectContentSpinner'}>
          <Spinner css={loading} size={SpinnerSize.medium} />
        </div>
      )}
      {storageFileLoadingStatus === 'failure' && (
        <div css={loading}>{formatMessage('Can not connect the storage.')}</div>
      )}
    </div>
  );
};
