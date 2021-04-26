// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';

// -------------------- Styles -------------------- //

const container = css`
  width: 100%;
  background-color: #ffffff;
  height: 100%;
  position: relative;
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
