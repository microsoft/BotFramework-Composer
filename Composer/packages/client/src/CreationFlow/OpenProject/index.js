/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import { DialogFooter, DefaultButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

export function OpenProject(props) {
  const { onOpen, onDismiss } = props;
  const [currentPath, setCurrentPath] = useState('');

  const onPathChange = path => {
    setCurrentPath(path);
  };

  const handleOpen = (path, storage) => {
    currentPath;
    onOpen(path, storage);
  };

  return (
    <Fragment>
      <LocationSelectContent onChange={onPathChange} onOpen={handleOpen} />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        {/* <PrimaryButton onClick={handleOpen} text={formatMessage('Open')} data-testid="SelectLocationOpen" /> */}
      </DialogFooter>
    </Fragment>
  );
}
