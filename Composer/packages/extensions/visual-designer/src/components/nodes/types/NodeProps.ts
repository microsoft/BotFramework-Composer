// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../../models/Boundary';

import { NodeEventhandler } from './NodeEventHandler';

export interface NodeProps {
  id: string;
  data: any;
  focused?: boolean;
  onEvent: NodeEventhandler;
  onResize: (boundary?: Boundary, id?) => object | void;
  isRoot?: boolean;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
};
