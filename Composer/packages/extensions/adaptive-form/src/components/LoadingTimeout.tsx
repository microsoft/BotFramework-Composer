// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/core';
import formatMessage from 'format-message';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

const container = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type LoadingTimeoutProps = {
  timeout?: number;
  children: React.ReactChild;
};

const LoadingTimeout: React.FC<LoadingTimeoutProps> = (props) => {
  const { children, timeout = 1000 } = props;
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const tId = setTimeout(() => {
      setShowFallback(true);
    }, timeout);

    return () => {
      clearTimeout(tId);
    };
  }, []);

  return showFallback ? (
    <div>{children}</div>
  ) : (
    <div css={container}>
      <Spinner label={formatMessage('Loading')} />
    </div>
  );
};

export { LoadingTimeout };
