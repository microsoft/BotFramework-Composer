import React from 'react';
import {
  NodeMenuComponent,
  EdgeMenuComponent,
  NodeWrapperComponent,
  ElementWrapperComponent,
} from '../types/PluggableComponents.types';
export interface RendererContextData {
  /** Edge Menu renderer. Could be a fly-out '+' menu. */
  EdgeMenu: EdgeMenuComponent;
  /** Node Menu renderer. Could be a fly-out '...' menu. */
  NodeMenu: NodeMenuComponent;
  /** Action node container renderer. Could be used to show the focus effect. */
  NodeWrapper: NodeWrapperComponent;
  /** Interactable elements container. Could be used to wrap a hyperlink. */
  ElementWrapper: ElementWrapperComponent;
}
export declare const DefaultRenderers: {
  EdgeMenu: React.FC<import('../types/PluggableComponents.types').EdgeMenuProps>;
  NodeMenu: React.FC<import('../types/PluggableComponents.types').NodeMenuProps>;
  NodeWrapper: React.FC<import('../types/PluggableComponents.types').NodeWrapperProps>;
  ElementWrapper: React.FC<import('../types/PluggableComponents.types').ElementWrapperProps>;
};
export declare const RendererContext: React.Context<RendererContextData>;
//# sourceMappingURL=RendererContext.d.ts.map
