// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { colors } from '../colors';

// -------------------- Styles -------------------- //

const container = css`
  width: 100%;
  background-color: ${colors.bg};
  height: 100%;
  position: relative;
`;

const top = css`
  width: 100%;
  height: 10px;
  background-color: ${colors.gray(30)};
`;

// -------------------- Conversation -------------------- //

const Conversation = (props) => {
  return (
    <div css={container} {...props}>
      {props.children}
    </div>
  );
};

export { Conversation };
