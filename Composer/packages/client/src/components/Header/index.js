/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { headerMain, aside } from './styles';

export const Header = () => {
  return (
    <div css={headerMain}>
      <div css={aside}>{formatMessage('Bot Framework Designer')}</div>
    </div>
  );
};
