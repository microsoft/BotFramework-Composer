/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import { DialogFooter, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

export function OpenProject(props) {
  const { onOpen, handleDismiss } = props;
  const [currentPath, setCurrentPath] = useState('');

  const onPathChange = path => {
    setCurrentPath(path);
  };

  const handleOpen = () => {
    onOpen(currentPath);
  };

  return (
    <Fragment>
      <LocationSelectContent onChange={onPathChange} />
      <DialogFooter>
        <DefaultButton onClick={handleDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleOpen} text={formatMessage('Open')} data-testid="SelectLocationOpen" />
      </DialogFooter>
    </Fragment>
  );
}
