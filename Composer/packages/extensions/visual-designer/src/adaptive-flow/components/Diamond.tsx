// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { ObiColors } from '../constants/ElementColors';
import { DiamondSize } from '../constants/ElementSizes';

export const Diamond = ({ color = ObiColors.AzureGray2, onClick = () => {}, ...rest }) => (
  <div
    {...rest}
    css={{
      width: DiamondSize.width,
      height: DiamondSize.height,
      cursor: 'pointer',
    }}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <svg
      fill="none"
      height={DiamondSize.height}
      style={{ display: 'block' }}
      viewBox="0 0 50 20"
      width={DiamondSize.width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25 0L50 10L25 20L-2.7865e-06 10L25 0Z" fill={color} />
    </svg>
  </div>
);
