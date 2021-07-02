// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditorEventHandler } from '../constants/NodeEventTypes';
import { ElementColor } from '../constants/ElementColors';

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
  hideComment?: boolean;

  /** Additional child id for multipart nodes such as 'BotAsks/UserInputs' in TextInput
   * to fit complicated view features like double-selection.
   * */
  nodeTab?: string;
}

export type NodeWrapperComponent = React.FC<NodeWrapperProps>;

// wraps elements inside a node to make them interactable
export interface ElementWrapperProps {
  /** The owner node's id */
  nodeId: string;

  /** A tag name to identify the role of wrapped element. E.g. hyper link / button */
  tagId: string;
}

export type ElementWrapperComponent = React.FC<ElementWrapperProps>;

export enum ElementWrapperTag {
  Link = 'link',
}
