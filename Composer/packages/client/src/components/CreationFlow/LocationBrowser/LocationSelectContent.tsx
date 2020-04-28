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

import { FileSelector } from './FileSelector';
import { loading, fileSelectorContainer } from './styles';

interface LocationSelectContentProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  onOpen?: (path: string, storage: string) => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
}

export const LocationSelectContent: React.FC<LocationSelectContentProps> = props => {
  const { onOpen, onCurrentPathUpdate, operationMode } = props;
  const { state } = useContext(StoreContext);
  const { storages, storageFileLoadingStatus, creationFlowStatus, focusedStorageFolder } = state;
  const currentStorageIndex = useRef(0);
  const onFileChosen = (item: File) => {
    if (item) {
      const { type, path } = item;
      const storageId = storages[currentStorageIndex.current].id;
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
    <div css={fileSelectorContainer}>
      {Object.keys(focusedStorageFolder).length > 0 && storageFileLoadingStatus === 'success' && (
        <FileSelector
          operationMode={operationMode}
          checkShowItem={checkShowItem}
          focusedStorageFolder={focusedStorageFolder}
          onCurrentPathUpdate={onCurrentPathUpdate}
          onFileChosen={onFileChosen}
        />
      )}
      {storageFileLoadingStatus === 'pending' && (
        <div>
          <Spinner size={SpinnerSize.medium} css={loading} />
        </div>
      )}
      {storageFileLoadingStatus === 'failure' && (
        <div css={loading}>{formatMessage('Can not connect the storage.')}</div>
      )}
    </div>
  );
};
