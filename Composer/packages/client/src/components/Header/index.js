// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';

import composerIcon from '../../images/composerIcon.svg';

import { headerContainer, title, botName } from './styles';

export const Header = props => {
  return (
    <div css={headerContainer}>
      <img style={{ marginLeft: '9px', marginTop: '6px' }} src={composerIcon} />
      <span css={title}>{formatMessage('Bot Framework Composer')}</span>
      <span css={botName}>{props.botName}</span>
    </div>
  );
};
