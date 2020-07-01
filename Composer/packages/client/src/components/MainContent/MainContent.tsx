// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { contentContainer } from './styles';

export const MainContent = (props: { children: Element }) => (
  <div css={contentContainer} role="main">
    {props.children}
  </div>
);
