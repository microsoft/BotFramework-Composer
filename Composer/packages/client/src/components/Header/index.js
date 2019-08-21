import React from 'react';
import formatMessage from 'format-message';

import { headerContainer, title, botName } from './styles';

export const Header = props => {
  return (
    <div css={headerContainer}>
      <span css={title}>{formatMessage('Bot Framework Composer')}</span>
      <span css={botName}>{props.botName}</span>
    </div>
  );
};
