// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditorEventHandler } from '../adaptive-sdk/constants/NodeEventTypes';
import { ElementColor } from '../adaptive-sdk/constants/ElementColors';

interface EventBasedElement {
  onEvent: EditorEventHandler;
}

interface StyledElement {
  colors?: ElementColor;
}

// by default, show a '+' fly-out menu on edge
export interface EdgeMenuProps extends EventBasedElement, StyledElement {
  arrayId: string;
  arrayPosition: number;
  arrayData: any;
}
export type EdgeMenuComponent = React.FC<EdgeMenuProps>;

// by default, show '...' menu on a node right-top corner
export interface NodeMenuProps extends EventBasedElement, StyledElement {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;
}

export type NodeMenuComponent = React.FC<NodeMenuProps>;

// by default, show a wrapper with focus effect
export interface NodeWrapperProps extends EventBasedElement, StyledElement {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;

  /** Additional child id for multipart nodes such as 'BotAsks/UserInputs' in TextInput
   * to fit complicated view features like double-selection.
   * */
  nodeTab?: string;
}

export type NodeWrapperComponent = React.FC<NodeWrapperProps>;
