// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import { DialogCreationCopy } from '../../../constants';
import { DialogWrapper } from '../../DialogWrapper';
import { DialogTypes } from '../../DialogWrapper/styles';
import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

interface OpenProjectProps extends RouteComponentProps<{}> {
  onOpen: (path: string, storage: string) => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onDismiss: () => void;
}

export const OpenProject: React.FC<OpenProjectProps> = props => {
  const { onOpen, onDismiss, onCurrentPathUpdate } = props;

  return (
    <DialogWrapper
      {...DialogCreationCopy.SELECT_LOCATION}
      onDismiss={onDismiss}
      isOpen={true}
      dialogType={DialogTypes.CreateFlow}
    >
      <div data-testid="SelectLocation">
        <LocationSelectContent
          operationMode={{
            read: true,
            write: false,
          }}
          onOpen={onOpen}
          onCurrentPathUpdate={onCurrentPathUpdate}
        />
        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};
