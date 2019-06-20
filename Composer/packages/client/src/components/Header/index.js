/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { headerMain, aside } from './styles';

export const Header = () => {
  return (
    <header>
      <div css={headerMain}>
        <div css={aside}>{formatMessage('Bot Framework Designer')}</div>
      </div>
    </header>
  );
};

Header.propTypes = {
  botStatus: PropTypes.string,
  botLoadErrorMsg: PropTypes.string,
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};
