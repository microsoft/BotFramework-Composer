// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';

import { container } from './styles';

export const LoadingSpinner: React.FC = () => {
  return (
    <div css={container}>
      <Spinner label={formatMessage('Loading')} />
    </div>
  );
};
