// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComponentClass, FC } from 'react';

import { Boundary } from '../../../models/Boundary';

import { NodeEventhandler } from './NodeEventHandler';
import { NodeMenuProps, EdgeMenuProps } from './MenuProps';

export interface NodeProps {
  id: string;
  data: any;
  focused?: boolean;
  isRoot?: boolean;
  onEvent: NodeEventhandler;
  onResize: (boundary?: Boundary, id?) => object | void;
  renderers: {
    EdgeMenu: ComponentClass<EdgeMenuProps> | FC<EdgeMenuProps>;
    NodeMenu: ComponentClass<NodeMenuProps> | FC<NodeMenuProps>;
  };
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
  renderers: {
    EdgeMenu: () => null,
    NodeMenu: () => null,
  },
};
