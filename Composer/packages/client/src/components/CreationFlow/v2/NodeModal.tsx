/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared/lib/components/DialogWrapper';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/components/Dialog';
import React from 'react';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';

const dialogFooterClass = mergeStyles({
  marginTop: '25px',
});

type NodeModalProps = {
  setIsOpen: Function;
  isOpen: boolean;
};

export const NodeModal: React.FC<NodeModalProps> = (props) => {
  return (
    <DialogWrapper
      dialogType={DialogTypes.DesignFlow}
      isOpen={props.isOpen}
      title="Node.js required"
      onDismiss={() => {
        props.setIsOpen(false);
      }}
    >
      <Text>
        {formatMessage(
          'Bot Framework Composer requires Node.js in order to create and run a new bot. Click “Install Node.js” to install the latest version'
        )}
      </Text>
      <DialogFooter className={dialogFooterClass}>
        <PrimaryButton
          data-testid="InstallNode"
          href="https://nodejs.org/en/download/"
          target="_blank"
          text={formatMessage('Install Node.js')}
        />
        <DefaultButton
          text={formatMessage('Cancel')}
          onClick={() => {
            props.setIsOpen(false);
          }}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
