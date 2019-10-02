/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter, DefaultButton } from 'office-ui-fabric-react';
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
