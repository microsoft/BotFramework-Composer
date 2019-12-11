// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { NodeEventhandler } from './NodeEventHandler';

export interface NodeMenuProps {
  nodeId: string;
  onEvent: NodeEventhandler;
}

export interface EdgeMenuProps {
  nodeArrayId: string;
  nodeArrayIndex: number;
  onEvent: NodeEventhandler;
}
