// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DetailedHTMLProps, HTMLAttributes, ComponentClass, FC } from 'react';

export type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export interface DivProps extends ElementProps {
  width?: number;
  height?: number;
}

export interface MultiLineDivProps extends DivProps {
  lineNum?: number;
}
export type ElementComponent<T extends ElementProps> = FC<T> | ComponentClass<T, any>;
