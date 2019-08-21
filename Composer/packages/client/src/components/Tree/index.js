import React from 'react';
import { PropTypes } from 'prop-types';

import { container } from './styles';

export const Tree = props => (
  <div css={[container(props.variant), props.extraCss]} data-testid="ProjectTree">
    {props.children}
  </div>
);

Tree.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.element,
};
