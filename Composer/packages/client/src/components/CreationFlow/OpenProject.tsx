// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { StorageFolder } from '../../recoilModel/types';
import { DialogCreationCopy } from '../../constants';
import { getAliasFromPayload, Profile } from '../../utils/electronUtil';

import { LocationSelectContent } from './LocationSelectContent';

interface OpenProjectFormData {
  path: string;
  storage: string;

  profile?: Profile; // abs payload to create bot
  source?: string; // where the payload come from
  alias?: string; // identifier that is used to track bots between imports
}

interface OpenProjectProps extends RouteComponentProps<{}> {
  focusedStorageFolder: StorageFolder;
  onOpen: (formData: OpenProjectFormData) => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onDismiss: () => void;
}

export const OpenProject: React.FC<OpenProjectProps> = (props) => {
  const { onOpen, onDismiss, onCurrentPathUpdate, focusedStorageFolder, location } = props;
  const handleOpen = async (path: string, storage: string) => {
    const dataToOpen: OpenProjectFormData = { path, storage };
    dataToOpen.path = path;
    if (location?.search) {
      const decoded = decodeURIComponent(location.search);
      const { source, payload } = querystring.parse(decoded);
      if (payload && typeof payload === 'string' && typeof source === 'string') {
        dataToOpen.profile = JSON.parse(payload);
        dataToOpen.source = source;
        dataToOpen.alias = await getAliasFromPayload(source, payload);
      }
    }
    onOpen(dataToOpen);
  };

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
          onOpen={handleOpen}
        />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};
