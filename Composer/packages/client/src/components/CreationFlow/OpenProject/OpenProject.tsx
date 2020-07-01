// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import { DialogCreationCopy } from '../../../constants';
import { DialogWrapper } from '../../DialogWrapper/DialogWrapper';
import { DialogTypes } from '../../DialogWrapper/styles';
import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { StorageFolder } from '../../../store/types';
interface OpenProjectProps extends RouteComponentProps<{}> {
  focusedStorageFolder: StorageFolder;
  onOpen: (path: string, storage: string) => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onDismiss: () => void;
}

export const OpenProject: React.FC<OpenProjectProps> = (props) => {
  const { onOpen, onDismiss, onCurrentPathUpdate, focusedStorageFolder } = props;

  return (
    <DialogWrapper
      {...DialogCreationCopy.SELECT_LOCATION}
      isOpen
      dialogType={DialogTypes.CreateFlow}
      onDismiss={onDismiss}
    >
      <div data-testid="SelectLocation">
        <LocationSelectContent
          focusedStorageFolder={focusedStorageFolder}
          operationMode={{
            read: true,
            write: false,
          }}
          onCurrentPathUpdate={onCurrentPathUpdate}
          onOpen={onOpen}
        />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};
