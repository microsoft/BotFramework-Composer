// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { container } from './styles';

const Conversation = (props) => {
  return (
    <div css={container} {...props}>
      {props.children}
    </div>
  );
};

export { Conversation };
