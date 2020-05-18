// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';

import { modalStyle } from './styles';

export const LoadingModal: React.FC<{ isOpen: boolean }> = props => {
  return (
    <Modal isOpen={props.isOpen} styles={modalStyle}>
      <Spinner label={formatMessage('Opening')} />
    </Modal>
  );
};
