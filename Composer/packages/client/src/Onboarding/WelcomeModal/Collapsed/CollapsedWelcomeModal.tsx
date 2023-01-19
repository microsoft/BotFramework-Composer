// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import formatMessage from 'format-message';
import { IconButton } from '@fluentui/react/lib/Button';
import { FluentTheme } from '@fluentui/theme';

import { useOnboardingContext } from '../../OnboardingContext';

import { buttonStyles, content } from './styles';

const CollapsedWelcomeModal = () => {
  const {
    actions: { exit, toggleMinimized },
  } = useOnboardingContext();

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
          styles={{ ...buttonStyles, icon: { color: FluentTheme.palette.white, fontSize: '12px' } }}
          title={formatMessage('Close')}
          onClick={exit}
        />
      </div>
    </div>
  );
};

export default CollapsedWelcomeModal;
