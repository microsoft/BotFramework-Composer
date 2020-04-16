// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import composerIcon from '../../images/composerIcon.svg';

import { headerContainer, title, botName } from './styles';

export const Header = (props) => {
  return (
    <div css={headerContainer}>
      <img
        style={{ marginLeft: '9px', marginTop: '6px' }}
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
      />
      <span css={title}>{formatMessage('Bot Framework Composer')}</span>
      <span css={botName}>{props.botName}</span>
    </div>
  );
};
