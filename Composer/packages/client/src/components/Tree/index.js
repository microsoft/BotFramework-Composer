/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container, top } from './styles';

export const Tree = props => (
  <div css={[container(props.variant), props.extraCss]}>
    <div css={top} />
    {props.children}
  </div>
);

Tree.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.element,
};
