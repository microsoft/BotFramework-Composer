// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { autoSaveState, dispatcherState } from '../recoilModel';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const syncIcon = css`
  color: ${NeutralColors.white};
  margin-left: 12px;
  font-size: 12px;
  animation-duration: 3s;
  animation-name: ${spin};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;

const autoSaveText = css`
  color: ${NeutralColors.white};
  display: block;
  margin-left: 8px;
  font-size: 11px;
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }

  25% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

const fadingText = css`
  animation: ${fadeOut} 4s;
`;

const recentlySavedPersistTime = 1000 * 3;

export const AutoSaveIndicator: React.FC<{}> = () => {
  const saveState = useRecoilValue(autoSaveState);
  const { setAutoSaveState } = useRecoilValue(dispatcherState);

  useEffect(() => {
    if (saveState === 'RecentlySaved') {
      // set a timer to change back to idle state
      setTimeout(() => {
        setAutoSaveState('Idle');
      }, recentlySavedPersistTime);
    }
  }, [saveState]);

  switch (saveState) {
    case 'Idle':
      return null;

    case 'Pending':
      return (
        <React.Fragment>
          <FontIcon css={syncIcon} iconName={'Sync'} />
          <span css={autoSaveText}>{formatMessage('Saving...')}</span>
        </React.Fragment>
      );

    case 'RecentlySaved':
      return <span css={[autoSaveText, fadingText]}>{formatMessage('Saved just now')}</span>;

    default:
      return null;
  }
};
