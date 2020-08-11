// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import formatMessage from 'format-message';
import { useRef } from 'react';
import { jsx, css } from '@emotion/core';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { useRecoilValue } from 'recoil';

import { File } from '../../recoilModel/types';
import { FileTypes } from '../../constants';
import { StorageFolder } from '../../recoilModel/types';
import { creationFlowStatusState, storagesState, storageFileLoadingStatusState } from '../../recoilModel';
import { CreationFlowStatus } from '../../constants';

import { FileSelector } from './FileSelector';

// -------------------- Styles -------------------- //

const fileSelectorContainer = css`
  height: 300px;
  display: flex;
  flex-direction: column;
`;

const loading = css`
  height: 50vh;
  width: 600px;
`;

// -------------------- LocationSelectContent -------------------- //

interface LocationSelectContentProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  createFolder?: (path: string, name: string) => void;
  updateFolder?: (path: string, oldName: string, newName: string) => void;
  focusedStorageFolder: StorageFolder;
  onOpen?: (path: string, storage: string) => void;
  onCurrentPathUpdate: (newPath: string, storageId?: string) => void;
}

export const LocationSelectContent: React.FC<LocationSelectContentProps> = (props) => {
  const { onOpen, onCurrentPathUpdate, operationMode, focusedStorageFolder } = props;
  const storages = useRecoilValue(storagesState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const storageFileLoadingStatus = useRecoilValue(storageFileLoadingStatusState);
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
          createFolder={props.createFolder}
          focusedStorageFolder={focusedStorageFolder}
          isWindows={isWindows}
          operationMode={operationMode}
          storages={storages}
          updateFolder={props.updateFolder}
          onCurrentPathUpdate={onCurrentPathUpdate}
          onFileChosen={onFileChosen}
        />
      )}
      {storageFileLoadingStatus === 'pending' && (
        <div data-testid={'locationSelectContentSpinner'}>
          <Spinner css={loading} size={SpinnerSize.medium} />
        </div>
      )}
      {storageFileLoadingStatus === 'failure' && (
        <div css={loading}>{formatMessage('Could not connect to storage.')}</div>
      )}
    </div>
  );
};
