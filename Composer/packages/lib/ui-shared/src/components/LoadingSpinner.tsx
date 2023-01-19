// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import formatMessage from 'format-message';

const container = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { message } = props;
  return (
    <div css={container}>
      <Spinner label={message || formatMessage('Loading')} />
    </div>
  );
};
