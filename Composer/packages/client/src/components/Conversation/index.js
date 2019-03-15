/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container, top } from './styles';

export const Conversation = props => (
  <div css={container}>
    <div css={top} />
    {props.children}
  </div>
);

Conversation.propTypes = {
  children: PropTypes.element,
};
