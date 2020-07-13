// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';

const container = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoadingSpinner: React.FC = () => {
  return (
    <div css={container}>
      <Spinner label={formatMessage('Loading')} />
    </div>
  );
};
