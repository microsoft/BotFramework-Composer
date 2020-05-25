// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditorEventHandler } from '../constants/NodeEventTypes';

// by default, show a '+' fly-out menu on edge
export interface EdgeMenuProps {
  arrayId: string;
  arrayPosition: number;
  arrayData: any;
  onEvent: EditorEventHandler;
}
export type EdgeMenuComponent = React.FC<EdgeMenuProps>;

// by default, show '...' menu on a node right-top corner
export interface NodeMenuProps {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;
}

export type NodeMenuComponent = React.FC<NodeMenuProps>;

// by default, show a wrapper with focus effect
export interface NodeWrapperProps {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;
}

export type NodeWrapperComponent = React.FC<NodeWrapperProps>;
