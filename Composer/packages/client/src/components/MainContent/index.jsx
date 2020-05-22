// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { contentContainer } from './styles';

export const MainContent = (props) => (
  <div css={contentContainer} role="main">
    {props.children}
  </div>
);

MainContent.propTypes = {
  children: PropTypes.element,
};
