// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { container } from './styles';

interface ITreeProps {
  variant: string;
  children: Element;
}

const Tree: React.FC<ITreeProps> = (props: ITreeProps) => (
  <div css={container(props.variant)} data-testid="ProjectTree" {...props}>
    {props.children}
  </div>
);

export { Tree };
