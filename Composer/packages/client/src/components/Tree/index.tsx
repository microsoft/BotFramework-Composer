// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { container } from './styles';

type ITreeProps = {
  variant: string;
  children: Element;
};

export const Tree = (props: ITreeProps) => (
  <div css={container(props.variant)} data-testid="ProjectTree" {...props}>
    {props.children}
  </div>
);
