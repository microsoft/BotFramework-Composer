// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export interface DivProps extends ElementProps {
  width?: number;
  height?: number;
}
