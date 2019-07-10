/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { headerContainer, title, botName } from './styles';

export const Header = props => {
  return (
    <div css={headerContainer}>
      <span css={title}>{formatMessage('Bot Framework Designer')}</span>
      <span css={botName}>{props.botName}</span>
    </div>
  );
};
