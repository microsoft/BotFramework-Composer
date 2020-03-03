// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../models/Boundary';

export interface NodeProps {
  id: string;
  tab?: string;
  data: any;
  focused?: boolean;
  onEvent: (action, id, ...rest) => object | void;
  onResize: (boundary: Boundary, id?) => object | void;

  isRoot?: boolean;
}

export interface CardProps {
  id: string;
  data: any;
  label: string;
  focused?: boolean;

  onEvent: (action, id, ...rest) => object | void;
  onResize?: (boundary?: Boundary, id?) => object | void;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
};
