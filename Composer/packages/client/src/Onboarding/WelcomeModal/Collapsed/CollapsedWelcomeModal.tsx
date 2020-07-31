// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import OnboardingContext from '../../OnboardingContext';
import { palette } from '../../palette';

import { buttonStyles, content } from './styles';

const CollapsedWelcomeModal = () => {
  const {
    actions: { exit, toggleMinimized },
  } = useContext(OnboardingContext);

  return (
    <div css={content}>
      <div>{formatMessage('Welcome')}</div>
      <div>
        <IconButton
          iconProps={{ iconName: 'FullScreen' }}
          styles={buttonStyles}
          title={formatMessage('Expand')}
          onClick={toggleMinimized}
        />
        <IconButton
          iconProps={{ iconName: 'ChromeClose' }}
          styles={{ ...buttonStyles, icon: { color: palette.white, fontSize: '12px' } }}
          title={formatMessage('Close')}
          onClick={exit}
        />
      </div>
    </div>
  );
};

export default CollapsedWelcomeModal;
