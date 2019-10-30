// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react';

import OnboardingContext from '../../context';
import { palette } from '../../palette';

import { buttonStyles, content } from './styles';

const CollapsedWelcomeModal = () => {
  const {
    actions: { exit, toggleMinimized },
  } = useContext(OnboardingContext);

  return (
    <div css={content}>
      <div>{formatMessage('Welcome')}</div>
      <IconButton
        iconProps={{ iconName: 'BackToWindow' }}
        onClick={toggleMinimized}
        styles={buttonStyles}
        title="Expand"
      />
      <IconButton
        iconProps={{ iconName: 'ChromeClose' }}
        onClick={exit}
        styles={{ ...buttonStyles, icon: { color: palette.white, fontSize: '12px' } }}
        title="Close"
      />
    </div>
  );
};

export default CollapsedWelcomeModal;
