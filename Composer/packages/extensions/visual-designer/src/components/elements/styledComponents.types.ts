// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DetailedHTMLProps, HTMLAttributes, ComponentClass, FC } from 'react';

export const UI_ELEMENT_KEY = 'ui:element';
export type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export interface MultiLineDivProps extends ElementProps {
  lineNum?: number;
}
export interface UIElement {
  [UI_ELEMENT_KEY]: ElementComponent<ElementProps>;
  propKey?: ElementProps;
}

export type ElementComponent<T extends ElementProps> = FC<T> | ComponentClass<T, any>;
