/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container } from './styles';

export const Conversation = props => {
  const { style, children } = props;
  return (
    <div css={container} style={style ? style : null}>
      {children}
    </div>
  );
};

Conversation.propTypes = {
  style: PropTypes.object,
  children: PropTypes.element,
};
