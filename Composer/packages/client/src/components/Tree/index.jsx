// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { container } from './styles';

export const Tree = props => (
  <div css={container(props.variant)} data-testid="ProjectTree" {...props}>
    {props.children}
  </div>
);

Tree.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.element
};
