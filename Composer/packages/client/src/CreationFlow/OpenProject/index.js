// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

export function OpenProject(props) {
  const { onOpen, onDismiss } = props;

  const handleOpen = (path, storage) => {
    onOpen(path, storage);
  };

  return (
    <div data-testid="SelectLocation">
      <LocationSelectContent onOpen={handleOpen} />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
      </DialogFooter>
    </div>
  );
}
