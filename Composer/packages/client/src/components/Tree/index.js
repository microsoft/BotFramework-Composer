/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container } from './styles';

export const Tree = props => (
  <div css={container} style={props.style ? props.style : null}>
    {props.children}
  </div>
);

Tree.propTypes = {
  style: PropTypes.object,
  children: PropTypes.element,
};
