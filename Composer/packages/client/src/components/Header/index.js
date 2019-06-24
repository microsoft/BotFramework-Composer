/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { headerMain, aside } from './styles';

export const Header = () => {
  return (
    <div css={headerMain}>
      <div css={aside}>{formatMessage('Bot Framework Designer')}</div>
    </div>
  );
};

Header.propTypes = {
  botStatus: PropTypes.string,
  botLoadErrorMsg: PropTypes.string,
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};
