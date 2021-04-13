// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';
import Dialog, { DialogType } from 'office-ui-fabric-react/lib/Dialog';

const container = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalControlGroup = css`
  padding: 10px;
`;

interface LoadingSpinnerProps {
  message?: string;
  inModal?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { message } = props;

  const renderLoadingSpinner = () => {
    return (
      <div css={container}>
        <Spinner label={message ?? formatMessage('Loading')} />
      </div>
    );
  };

  return props.inModal ? (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
      }}
    >
      <div css={modalControlGroup}>{renderLoadingSpinner()} </div>
    </Dialog>
  ) : (
    renderLoadingSpinner()
  );
};
