// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { colors } from '../constants';

// -------------------- Styles -------------------- //

const container = (variant) => {
  let height = '350px';
  switch (variant) {
    case 'large':
      height = '500px';
      break;
    case 'largest':
      height = '870px';
      break;
    case 'fill':
      height = '100%';
      break;
    default:
      break;
  }

  return css`
    width: 100%;
    background-color: ${colors.white};
    height: ${height};
    overflow: auto;
    border-top: 2px solid ${colors.blue};
  `;
};

// -------------------- Tree -------------------- //

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
