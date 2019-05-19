/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container } from './styles';

export const Conversation = props => <div css={[container, props.extraCss]}>{props.children}</div>;

Conversation.propTypes = {
  children: PropTypes.element,
};
