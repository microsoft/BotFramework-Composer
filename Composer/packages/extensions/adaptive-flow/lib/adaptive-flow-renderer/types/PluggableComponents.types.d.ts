/// <reference types="react" />
import { EditorEventHandler } from '../constants/NodeEventTypes';
import { ElementColor } from '../constants/ElementColors';
interface EventBasedElement {
  onEvent: EditorEventHandler;
}
interface StyledElement {
  colors?: ElementColor;
}
export interface EdgeMenuProps extends EventBasedElement, StyledElement {
  arrayId: string;
  arrayPosition: number;
  arrayData: any;
}
export declare type EdgeMenuComponent = React.FC<EdgeMenuProps>;
export interface NodeMenuProps extends EventBasedElement, StyledElement {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;
}
export declare type NodeMenuComponent = React.FC<NodeMenuProps>;
export interface NodeWrapperProps extends EventBasedElement, StyledElement {
  nodeId: string;
  nodeData: any;
  onEvent: EditorEventHandler;
  /** Additional child id for multipart nodes such as 'BotAsks/UserInputs' in TextInput
   * to fit complicated view features like double-selection.
   * */
  nodeTab?: string;
}
export declare type NodeWrapperComponent = React.FC<NodeWrapperProps>;
export interface ElementWrapperProps {
  /** The owner node's id */
  nodeId: string;
  /** A tag name to identify the role of wrapped element. E.g. hyper link / button */
  tagId: string;
}
export declare type ElementWrapperComponent = React.FC<ElementWrapperProps>;
export declare enum ElementWrapperTag {
  Link = 'link',
}
export {};
//# sourceMappingURL=PluggableComponents.types.d.ts.map
